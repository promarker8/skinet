// not a class, it's an enum. to track the payment coming from the client
// the status flags will have additional attributes so we can return the text of the status
// each status will have a code (0,1,2) and some text

using System.Runtime.Serialization;

namespace Core.Entities.OrderAggregate
{
    public enum OrderStatus
    {
        [EnumMember(Value = "Pending")]
        Pending,

        [EnumMember(Value = "Payment Received")]
        PaymentReceived,

        [EnumMember(Value = "Payment Failed")]
        PaymentFailed
    }
}