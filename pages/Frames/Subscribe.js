import { Subscribe } from "/components/Subscribe";
import { useState, useEffect } from "react";

export default function BlankPage() {
  const [subscribeArray, setSubscribeArray] = useState([]);

  return (
    <div
      className="widget-container"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Subscribe
        senderAddress="0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"
        onSubscribe={(address, state) => {
          console.log("New subscriber: ", { address, state });
          setSubscribeArray((prevArray) => [...prevArray, { address, state }]);
        }}
        onUnsubscribe={(address, state) => {
          console.log("Unsubscribed: ", { address, state });
          setSubscribeArray((prevArray) => {
            const index = prevArray.findIndex((a) => a.address === address);
            if (index !== -1) {
              const newArray = [...prevArray];
              newArray[index].state = state;
              return newArray;
            }
            return prevArray;
          });
        }}
        onError={(error) => console.log("Error subscribing: " + error)}
        env="production"
      />

      <div
        id="subscribeArray"
        style={{ textAlign: "center", fontSize: "12px" }}
      >
        {JSON.stringify(subscribeArray)}
      </div>
    </div>
  );
}
