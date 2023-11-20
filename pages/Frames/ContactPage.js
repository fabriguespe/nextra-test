import { ContactPage } from "/components/ContactPage";

export default function BlankPage() {
  return (
    <div className="widget-container Link">
      <ContactPage
        domain="shanemac.eth"
        walletAddress="0x7E0b0363404751346930AF92C80D1fef932Cc48a"
      />
    </div>
  );
}
