import Home from "./Home";
import { XMTPProvider, attachmentContentTypeConfig } from "@xmtp/react-sdk";

const contentTypeConfigs = [attachmentContentTypeConfig];

export function FloatingInbox({
  isPWA = false,
  wallet,
  onLogout,
  isContained = false,
  isConsent = false,
}) {
  return (
    <XMTPProvider contentTypeConfigs={contentTypeConfigs}>
      <Home
        isPWA={isPWA}
        wallet={wallet}
        onLogout={onLogout}
        isConsent={isConsent}
        isContained={isContained}
      />
    </XMTPProvider>
  );
}
