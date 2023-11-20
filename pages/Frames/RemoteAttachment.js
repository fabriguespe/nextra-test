import { FloatingInbox } from "/components/FloatingInbox";

export default function BlankPage() {
  return (
    <div
      className="widget-container"
      style={{ padding: "0px", height: "400px" }}
    >
      <FloatingInbox
        env="production"
        isContained={true}
        initialAddress="0x93E2fc3e99dFb1238eB9e0eF2580EFC5809C7204"
      />
    </div>
  );
}
