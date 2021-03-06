// Common
import {
	OrderCancelledEvent,
	Publisher,
	Subjects
} from '@hudaprs-ticketing/common'

class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled
}

export { OrderCancelledPublisher }
