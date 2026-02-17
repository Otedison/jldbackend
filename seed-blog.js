/**
 * Blog Seed Script
 * This script inserts the Women Leadership blog post into MongoDB.
 * 
 * Usage: node seed-blog.js
 * 
 * Note: Make sure MONGO_URI is set in your .env file or environment variables.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set. Please configure your MongoDB connection.');
  console.error('Set it in Backend/.env file or as an environment variable.');
  process.exit(1);
}

// Require the Blog model
const Blog = require('./src/models/Blog');

const BLOG_POST = {
  title: "Women Leadership: Empowered Women, Empowering the World",
  slug: "women-leadership-empowered-women-empowering-world",
  excerpt: "Inside the Chianda Civic Education Women Chapter – nurturing informed, bold and transformative leaders.",
  content: `<p>Jukwaa La Demokrasia continues to champion inclusive governance, civic awareness, and community empowerment across Kenya. One of our key pillars is the belief that when women are empowered with knowledge and leadership skills, entire communities thrive.</p>

<p>It is in this spirit that we proudly introduce the <strong>Chianda Civic Education Women Chapter</strong> – a platform dedicated to nurturing strong, informed, and confident women leaders.</p>

<h2>Building Voices, Building Leaders</h2>
<p>The Chianda Women Chapter was established to provide women with a safe and supportive space to:</p>
<ul>
<li>Learn about their civic and constitutional rights</li>
<li>Participate meaningfully in democratic processes</li>
<li>Develop leadership and advocacy skills</li>
<li>Share experiences and support one another</li>
</ul>
<p>Through regular civic education sessions, mentorship, and dialogue forums, the chapter seeks to transform women from passive observers into active change‑makers.</p>

<h2>Rise. Lead. Empower.</h2>
<p>Our guiding message reflects the journey we envision for every woman:</p>
<ul>
<li><strong>Rise</strong> – above social, economic, and cultural barriers</li>
<li><strong>Lead</strong> – with integrity, courage, and purpose</li>
<li><strong>Empower</strong> – others by sharing knowledge and opportunities</li>
</ul>
<p><em>— Chianda Women Chapter</em></p>
<p>This three‑fold approach ensures that empowerment is not individual but collective. When one woman rises, she lifts others with her.</p>

<h2>Upcoming Women Chapter Forum</h2>
<p>To strengthen this mission, the Chianda Civic Education Women Chapter will host a special forum:</p>
<ul>
<li><strong>Date:</strong> 21st February 2026</li>
<li><strong>Time:</strong> 9:00 AM – 4:00 PM</li>
</ul>
<p>The forum will bring together women leaders, community members, and civic educators to discuss governance, participation, leadership, and community development.</p>
<p><strong>Open to all – be the change.</strong></p>

<h2>Why This Matters</h2>
<p>Women make up a significant portion of our society, yet their voices are often underrepresented in decision‑making spaces. By investing in women's civic education, we invest in:</p>
<ul>
<li>Stronger families</li>
<li>Transparent leadership</li>
<li>Peaceful communities</li>
<li>Sustainable development</li>
</ul>
<p>When women are informed, communities are transformed.</p>

<h2>A voice from Chianda</h2>
<blockquote>
<p>"Before this chapter, I never thought my voice could matter in a village meeting. Now I know my rights, and I'm teaching other women to speak up. We are no longer waiting for permission—we are leading."</p>
<p>— Margaret A., community mobilizer, Chianda</p>
</blockquote>

<h2>Join the Movement</h2>
<p>Jukwaa La Demokrasia invites all stakeholders, partners, and community members to support and participate in this important initiative. Together, let us continue to build a society where every woman has the power, voice, and opportunity to shape her future.</p>

<hr>
<p><strong>Website:</strong> jukwaalademokrasia.org<br>
<strong>Email:</strong> info@jukwaalademokrasia.org<br>
<strong>Social:</strong> @JukwaaDemokrasia</p>

<p><em>Maurice Otunga Opiyo</em><br>
<em>Maurice is a human rights advocate and researcher focusing on labor rights and migration issues in East Africa. He has worked with multiple civil society organizations to document abuses against migrant workers and advocate for policy reforms.</em></p>`,
  coverImageUrl: "https://placehold.co/1200x600/1e3a5f/ffffff?text=Women+Leadership",
  authorName: "Maurice Otunga Opiyo",
  status: "published",
  contentType: "story",
  publishedAt: new Date("2026-02-01"),
};

async function seedBlog() {
  console.log('\n========== BLOG SEED SCRIPT ==========\n');
  console.log('Connecting to MongoDB...\n');

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log('✓ Connected to MongoDB successfully!');
    console.log(`Database: ${mongoose.connection.name}\n`);

    // Check if blog post already exists
    const existingBlog = await Blog.findOne({ slug: BLOG_POST.slug });
    
    if (existingBlog) {
      console.log('⚠️  Blog post already exists!');
      console.log(`   Title: ${existingBlog.title}`);
      console.log(`   Slug: ${existingBlog.slug}`);
      console.log(`   Status: ${existingBlog.status}`);
      console.log('\nNo changes made.\n');
    } else {
      // Insert the blog post
      const insertedBlog = await Blog.create(BLOG_POST);
      console.log('✓ Blog post inserted successfully!');
      console.log(`   Title: ${insertedBlog.title}`);
      console.log(`   Slug: ${insertedBlog.slug}`);
      console.log(`   Status: ${insertedBlog.status}`);
      console.log(`   ContentType: ${insertedBlog.contentType}`);
      console.log(`   PublishedAt: ${insertedBlog.publishedAt}`);
      console.log('\n===========================================');
      console.log('Blog post has been seeded to the database!');
      console.log('===========================================\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error seeding blog:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB.');
    console.log('\n===========================================\n');
  }
}

// Run the seed
seedBlog();

