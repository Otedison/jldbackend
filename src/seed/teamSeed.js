const TeamMember = require("../models/TeamMember");

const DEFAULT_TEAM_MEMBERS = [
  {
    name: "Wycliffe",
    role: "Program Coordinator",
    imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Wycliffe",
    bio: "An accomplished information specialist with a passion for civic education, democracy awareness, and youth empowerment. With experience in information management and dissemination, he believes access to knowledge is a foundation for informed citizenship and active participation in society.",
    order: 1,
    isActive: true,
  },
  {
    name: "Faizah Omar",
    role: "Finance Coordinator",
    imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Faizah+Omar",
    bio: "Secures the resources that fuel our mission, guaranteeing accountability and impact. With expertise in financial management and strategic planning, she ensures our organization's financial health and sustainability.",
    order: 2,
    isActive: true,
  },
  {
    name: "Auma Evans",
    role: "Media & Public Relations",
    imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Auma+Evans",
    bio: "A seasoned journalist, Public Relations and Communication Strategist, and Corporate MC and Moderator with years of experience in uncovering compelling stories on politics and governance, delivering impactful narratives across print, broadcast, and digital platforms.",
    order: 3,
    isActive: true,
  },
  {
    name: "Maurice Otunga",
    role: "Team Member",
    imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Maurice+Otunga",
    bio: "Supports cross-functional implementation and contributes to programme delivery across the organization.",
    order: 4,
    isActive: true,
  },
  {
    name: "Obwolo Boniface",
    role: "Team Member",
    imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Obwolo+Boniface",
    bio: "Contributes to day-to-day operations and helps strengthen field execution for civic education activities.",
    order: 5,
    isActive: true,
  },
  {
    name: "To Be Announced",
    role: "Team Member",
    imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Coming+Soon",
    bio: "This team profile will be updated soon.",
    order: 6,
    isActive: true,
  },
];

async function seedTeamMembersIfEmpty() {
  const count = await TeamMember.countDocuments();
  if (count > 0) return 0;
  const inserted = await TeamMember.insertMany(DEFAULT_TEAM_MEMBERS);
  return inserted.length;
}

module.exports = {
  seedTeamMembersIfEmpty,
};
