import { FloatingInbox } from "/components/FloatingInbox-frames";

export default function BlankPage() {
  return (
    <div
      className="widget-container"
      style={{ padding: "0px", height: "400px" }}
    >
      <FloatingInbox env="production" isContained={true} isConsent={false} />
    </div>
  );
}
