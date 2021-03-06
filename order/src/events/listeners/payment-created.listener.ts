// Common
import {
	Listener,
	Subjects,
	PaymentCreatedEvent,
	OrderStatus
} from '@hudaprs-ticketing/common'

// Constant
import { ORDER_SERVICE } from '../../constants'

// NATS
import { Message } from 'node-nats-streaming'

// Models
import { Order } from '../../models'

// Events
import { OrderCompletePublisher } from '../publishers'

class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated
	queueGroupName = ORDER_SERVICE

	/**
	 * @description Watch any incoming data from subject
	 *
	 * @param {PaymentCreatedEvent['data']} data
	 * @param {Message} message
	 *
	 * @return {Promise<void>} Promise<void>
	 */
	async onMessage(
		data: PaymentCreatedEvent['data'],
		message: Message
	): Promise<void> {
		const order = await Order.findById(data.orderId)

		if (!order) throw new Error('Order Not Found')

		order.set({ status: OrderStatus.Complete })
		await order.save()

		// Publish to update status order in payment service
		await new OrderCompletePublisher(this.client).publish({
			id: order.id,
			status: order.status,
			version: order.version
		})

		message.ack()
	}
}

export { PaymentCreatedListener }
