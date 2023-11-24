import { ProfileCard } from "/components/ProfileCard";

export default function BlankPage() {
  return (
    <div className="widget-container">
      <ProfileCard
        domain="shanemac.eth"
        walletAddress="0x7E0b0363404751346930AF92C80D1fef932Cc48a"
        description="Hi, I'm Shane, Co-Founder of XMTP."
        image="https://pbs.twimg.com/profile_images/1561559544148500480/lBJtF9DK_400x400.jpg"
      />
    </div>
  );
}
