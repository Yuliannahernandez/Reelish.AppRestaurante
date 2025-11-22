
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

const PayPalButton = ({ total, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  // Convertir de CRC a USD (usando el tipo de cambio)
  const totalEnUSD = (total / 520.50).toFixed(2);

  console.log('PayPalButton renderizado');
  console.log('Total en CRC:', total);
  console.log('Total en USD:', totalEnUSD);

  const createOrder = (data, actions) => {
    console.log('createOrder ejecutándose...');
    console.log('Data:', data);
    console.log('Actions:', actions);
    
    setLoading(true);
    
    try {
      const order = actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalEnUSD,
            },
            description: "Pedido en Restaurante"
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING"
        }
      });
      
      console.log('Orden creada');
      return order;
      
    } catch (error) {
      console.error('Error en createOrder:', error);
      setLoading(false);
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    console.log('onApprove ejecutándose');
    console.log('Data:', data);
    
    try {
      const details = await actions.order.capture();
      console.log("Pago completado:", details);
      
      setLoading(false);
      
      if (onSuccess) {
        onSuccess({
          orderId: details.id,
          status: details.status,
          payerId: details.payer.payer_id,
          payerEmail: details.payer.email_address,
          amount: details.purchase_units[0].amount.value,
          currency: details.purchase_units[0].amount.currency_code
        });
      }
    } catch (error) {
      console.error("Error capturando pago:", error);
      setLoading(false);
      if (onError) onError(error);
    }
  };

  const onCancel = (data) => {
    console.log("Pago cancelado:", data);
    setLoading(false);
    if (onError) onError({ message: "Pago cancelado por el usuario" });
  };

  const onErrorHandler = (err) => {
    console.error("Error en PayPal:", err);
    setLoading(false);
    if (onError) onError(err);
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Procesando pago...</p>
        </div>
      )}
      
      <div className="border-2 border-dashed border-blue-300 p-2 rounded">
        <p className="text-xs text-center text-gray-500 mb-2">
          
        </p>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onErrorHandler}
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 55
          }}
          disabled={loading}
          forceReRender={[total]}
        />
      </div>
    </div>
  );
};

export default PayPalButton;