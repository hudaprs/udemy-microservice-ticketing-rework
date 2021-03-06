// Express
import { Request, Response, Router } from 'express'

// Common
import {
	NotFoundError,
	OrderStatus,
	requireAuthMiddleware_requireAuth,
	UnauthorizedError
} from '@hudaprs-ticketing/common'

// NATS Wrapper
import { natsWrapper } from '../nats-wrapper'

// Model
import { Order } from '../models'

// Events
import { OrderCancelledPublisher } from '../events'

const router: Router = Router()

router.delete(
	'/:id',
	requireAuthMiddleware_requireAuth,
	async (req: Request, res: Response) => {
		const order = await Order.findById(req.params.id).populate('ticket')
		if (!order) throw new NotFoundError('Order not found')

		// Check if order is not the same as user that authenticated
		if (order.userId !== req.currentUser!.id)
			throw new UnauthorizedError('You have no permission to cancel this order')

		// Set the status to cancelled
		order.status = OrderStatus.Cancelled
		await order.save()

		// Publish Event
		await new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id
			}
		})

		res.status(200).json(order)
	}
)

export { router as deleteRouter }
