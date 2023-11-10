import { Broadcast } from "/components/Broadcast";

export default function BlankPage() {
  return (
    <div className="widget-container">
      <Broadcast
        env="production"
        walletAddresses={[
          "0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204",
          "0xdf9A8d961A55e75E1FAEc72037f89251f84ADCc3",
        ]}
        placeholderMessage="Enter a broadcast message here"
        onMessageSuccess={(message) =>
          console.log("Message sent" + message.content)
        }
      />
    </div>
  );
}
