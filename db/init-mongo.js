// MongoDB initialization script for MERN backend.
// Creates collections, indexes, and seed data for first-time setup.

const dbName = process.env.MONGO_INITDB_DATABASE || "jukwaa_hub";
const appDb = db.getSiblingDB(dbName);

function ensureCollection(name) {
  const exists = appDb.getCollectionInfos({ name }).length > 0;
  if (!exists) appDb.createCollection(name);
}

[
  "blogs",
  "careers",
  "resources",
  "resourceDownloads",
  "subscriptions",
  "events",
  "careerapplications",
  "teammembers",
  "videos",
  "galleryitems",
].forEach(ensureCollection);

appDb.blogs.createIndex({ slug: 1 }, { unique: true });
appDb.blogs.createIndex({ status: 1, contentType: 1, publishedAt: -1 });

appDb.careers.createIndex({ status: 1, deadline: 1 });
appDb.careers.createIndex({ referenceNumber: 1 });

appDb.resources.createIndex({ slug: 1 }, { unique: true });
appDb.resources.createIndex({ category: 1, isPublished: 1 });

appDb.resourceDownloads.createIndex({ resourceId: 1, downloadedAt: -1 });

appDb.subscriptions.createIndex({ email: 1 }, { unique: true });
appDb.subscriptions.createIndex({ status: 1 });

appDb.events.createIndex({ slug: 1 }, { unique: true });
appDb.events.createIndex({ startAt: 1, status: 1 });
appDb.careerapplications.createIndex({ career: 1, createdAt: -1 });
appDb.careerapplications.createIndex({ email: 1 });
appDb.teammembers.createIndex({ isActive: 1, order: 1 });
appDb.videos.createIndex({ isActive: 1, order: 1 });
appDb.galleryitems.createIndex({ isActive: 1, order: 1 });

const now = new Date();

if (appDb.blogs.countDocuments() === 0) {
  appDb.blogs.insertMany([
    {
      title: "Citizen Budget Literacy Drives County Accountability",
      slug: "citizen-budget-literacy-county-accountability",
      excerpt: "Communities in three counties used budget hearings to influence allocations.",
      content:
        "This story highlights how trained residents submitted budget memoranda and tracked implementation in health and water sectors.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      authorName: "Editorial Team",
      status: "published",
      contentType: "news",
      publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "What Public Participation Looks Like in Practice",
      slug: "public-participation-in-practice",
      excerpt: "A field report from ward-level forums.",
      content:
        "Ward-level civic forums continue to improve transparency where citizen groups receive practical policy engagement training.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      authorName: "Programmes Desk",
      status: "published",
      contentType: "blog",
      publishedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "From Baraza to Policy: A Community Story of Water Access",
      slug: "baraza-to-policy-water-access",
      excerpt: "Residents used civic petitions to unlock delayed water funding.",
      content: "A practical story showing how county residents used petitions and budget hearings to push implementation.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
      authorName: "Field Team",
      status: "published",
      contentType: "story",
      publishedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

if (appDb.careers.countDocuments() === 0) {
  appDb.careers.insertMany([
    {
      title: "Monitoring and Evaluation Officer",
      referenceNumber: "JLD-CR-2026-001",
      department: "Programmes",
      location: "Nairobi",
      employmentType: "full-time",
      description: "Lead programme impact tracking, reporting, and learning cycles.",
      requirements:
        "3+ years in M&E, strong data analysis skills, and NGO programme reporting experience.",
      applicationUrl: "https://example.org/careers/me-officer",
      deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: "open",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Community Mobilizer - Coast Region",
      referenceNumber: "JLD-CR-2026-002",
      department: "Civic Education",
      location: "Mombasa",
      employmentType: "contract",
      description: "Coordinate county civic forums and community outreach campaigns.",
      requirements: "Experience in facilitation, civic education, and stakeholder engagement.",
      applicationUrl: "https://example.org/careers/community-mobilizer",
      deadline: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      status: "open",
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

if (appDb.resources.countDocuments() === 0) {
  appDb.resources.insertMany([
    {
      title: "County Budget Participation Toolkit",
      slug: "county-budget-participation-toolkit",
      description: "Step-by-step guide for citizens joining county budget cycles.",
      category: "Toolkit",
      fileName: "county-budget-toolkit.pdf",
      fileUrl: "https://example.org/resources/county-budget-toolkit.pdf",
      fileSizeBytes: 2543000,
      language: "English & Kiswahili",
      publishedYear: 2026,
      isPublished: true,
      downloadCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Civic Rights Handbook",
      slug: "civic-rights-handbook",
      description: "Core constitutional rights and practical engagement pathways.",
      category: "Handbook",
      fileName: "civic-rights-handbook.pdf",
      fileUrl: "https://example.org/resources/civic-rights-handbook.pdf",
      fileSizeBytes: 3197000,
      language: "English",
      publishedYear: 2026,
      isPublished: true,
      downloadCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

if (appDb.subscriptions.countDocuments() === 0) {
  appDb.subscriptions.insertMany([
    {
      email: "jane.doe@example.org",
      fullName: "Jane Doe",
      source: "homepage",
      status: "active",
      subscribedAt: now,
    },
    {
      email: "youth.group@example.org",
      fullName: "Youth Action Group",
      source: "events-page",
      status: "active",
      subscribedAt: now,
    },
  ]);
}

if (appDb.events.countDocuments() === 0) {
  appDb.events.insertMany([
    {
      title: "County Budget Forum - Nakuru",
      slug: "county-budget-forum-nakuru-2026",
      description: "Public participation forum on budget priorities and service delivery.",
      venue: "Nakuru Social Hall",
      isVirtual: false,
      startAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationUrl: "https://example.org/events/nakuru-budget-forum",
      capacity: 350,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Youth Civic Leadership Virtual Bootcamp",
      slug: "youth-civic-leadership-virtual-bootcamp",
      description: "Virtual sessions on civic organizing and policy monitoring.",
      venue: "Online",
      isVirtual: true,
      startAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      registrationUrl: "https://example.org/events/youth-bootcamp",
      capacity: 500,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

if (appDb.teammembers.countDocuments() === 0) {
  appDb.teammembers.insertMany([
    {
      name: "Wycliffe",
      role: "Program Coordinator",
      imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Wycliffe",
      bio: "An accomplished information specialist with a passion for civic education, democracy awareness, and youth empowerment. With experience in information management and dissemination, he believes access to knowledge is a foundation for informed citizenship and active participation in society.",
      order: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Faizah Omar",
      role: "Finance Coordinator",
      imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Faizah+Omar",
      bio: "Secures the resources that fuel our mission, guaranteeing accountability and impact. With expertise in financial management and strategic planning, she ensures our organization's financial health and sustainability.",
      order: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Auma Evans",
      role: "Media & Public Relations",
      imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Auma+Evans",
      bio: "A seasoned journalist, Public Relations and Communication Strategist, and Corporate MC and Moderator with years of experience in uncovering compelling stories on politics and governance, delivering impactful narratives across print, broadcast, and digital platforms.",
      order: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Maurice Otunga",
      role: "Team Member",
      imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Maurice+Otunga",
      bio: "Supports cross-functional implementation and contributes to programme delivery across the organization.",
      order: 4,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Obwolo Boniface",
      role: "Team Member",
      imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Obwolo+Boniface",
      bio: "Contributes to day-to-day operations and helps strengthen field execution for civic education activities.",
      order: 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "To Be Announced",
      role: "Team Member",
      imageUrl: "https://placehold.co/520x620/e5e7eb/111827?text=Coming+Soon",
      bio: "This team profile will be updated soon.",
      order: 6,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

if (appDb.videos.countDocuments() === 0) {
  appDb.videos.insertMany(
    Array.from({ length: 4 }, (_, index) => ({
      title: `Jukwaa Video ${index + 1}`,
      videoUrl:
        "https://www.youtube.com/watch?v=i3QQd1XZw5s&pp=ygUUanVrd2FhIGxhIGRlbW9rcmFzaWHSBwkJhwoBhyohjO8%3D",
      description: "Placeholder video from Jukwaa media library.",
      order: index + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }))
  );
}

if (appDb.resourceDownloads.countDocuments() === 0) {
  const toolkit = appDb.resources.findOne({ slug: "county-budget-participation-toolkit" });
  if (toolkit) {
    appDb.resourceDownloads.insertOne({
      resourceId: toolkit._id,
      email: "jane.doe@example.org",
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      downloadedAt: now,
    });

    appDb.resources.updateOne(
      { _id: toolkit._id },
      { $inc: { downloadCount: 1 }, $set: { updatedAt: now } }
    );
  }
}
