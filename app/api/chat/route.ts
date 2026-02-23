import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

// Fetch all portfolio data from Sanity CMS
async function fetchPortfolioData() {
    const [profile, skills, experience, projects, certifications, achievements] = await Promise.all([
        client.fetch(`*[_type == "profile"][0]{
            firstName, lastName, headline, shortBio, email, phone, location, availability, yearsOfExperience, socialLinks
        }`),
        client.fetch(`*[_type == "skill"] | order(category asc, order asc){
            name, category, proficiency, percentage, yearsOfExperience
        }`),
        client.fetch(`*[_type == "experience"] | order(startDate desc){
            company, position, employmentType, location, startDate, endDate, current, responsibilities, achievements, technologies[]->{ name }
        }`),
        client.fetch(`*[_type == "project"] | order(order asc){
            title, tagline, category, technologies[]->{ name }, liveUrl, githubUrl
        }`),
        //client.fetch(`*[_type == "education"] | order(endDate desc){
        //    institution, degree, fieldOfStudy, startDate, endDate, current, gpa, description, achievements
        //}`),
        client.fetch(`*[_type == "certification"] | order(issueDate desc){
            name, issuer, issueDate, expiryDate, credentialUrl, description
        }`),
        //client.fetch(`*[_type == "service"] | order(order asc){
        //    title, shortDescription, features, pricing, timeline, technologies[]->{ name }
        //}`),
        client.fetch(`*[_type == "achievement"] | order(date desc){
            title, type, issuer, date, description
        }`),
    ]);

    return { profile, skills, experience, projects, certifications, achievements };
}

// Format portfolio data into a readable text block for the system prompt
function formatPortfolioContext(data: Record<string, any>) {
    const sections: string[] = [];

    // Profile
    if (data.profile) {
        const p = data.profile;
        sections.push(`## About Me
Name: ${[p.firstName, p.lastName].filter(Boolean).join(" ")}
Headline: ${p.headline || "N/A"}
Bio: ${p.shortBio || "N/A"}
Location: ${p.location || "N/A"}
Email: ${p.email || "N/A"}
Phone: ${p.phone || "N/A"}
Years of Experience: ${p.yearsOfExperience || "N/A"}
Availability: ${p.availability || "N/A"}
${p.socialLinks ? `Social Links: ${JSON.stringify(p.socialLinks)}` : ""}`);
    }

    // Skills
    if (data.skills?.length > 0) {
        const grouped: Record<string, string[]> = {};
        for (const s of data.skills) {
            const cat = s.category || "Other";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(`${s.name} (${s.proficiency || s.percentage || "N/A"}%${s.yearsOfExperience ? `, ${s.yearsOfExperience} yrs` : ""})`);
        }
        const skillLines = Object.entries(grouped).map(([cat, items]) => `- ${cat}: ${items.join(", ")}`).join("\n");
        sections.push(`## My Skills\n${skillLines}`);
    }

    // Experience
    if (data.experience?.length > 0) {
        const expLines = data.experience.map((e: any) => {
            const dateRange = `${e.startDate || "?"} - ${e.current ? "Present" : e.endDate || "?"}`;
            const techs = e.technologies?.map((t: any) => t?.name).filter(Boolean).join(", ");
            const resp = e.responsibilities?.length > 0 ? `\n  Responsibilities: ${e.responsibilities.join("; ")}` : "";
            const achv = e.achievements?.length > 0 ? `\n  Achievements: ${e.achievements.join("; ")}` : "";
            return `- ${e.position} at ${e.company} (${dateRange}, ${e.employmentType || "N/A"}, ${e.location || "N/A"})${techs ? `\n  Technologies: ${techs}` : ""}${resp}${achv}`;
        }).join("\n");
        sections.push(`## My Work Experience\n${expLines}`);
    }

    // Projects
    if (data.projects?.length > 0) {
        const projLines = data.projects.map((p: any) => {
            const techs = p.technologies?.map((t: any) => t?.name).filter(Boolean).join(", ");
            const urls = [p.liveUrl ? `Live: ${p.liveUrl}` : "", p.githubUrl ? `GitHub: ${p.githubUrl}` : ""].filter(Boolean).join(", ");
            return `- ${p.title}${p.category ? ` [${p.category}]` : ""}: ${p.tagline || ""}${techs ? `\n  Tech: ${techs}` : ""}${urls ? `\n  Links: ${urls}` : ""}`;
        }).join("\n");
        sections.push(`## My Projects\n${projLines}`);
    }

    // Education
    /* if (data.education?.length > 0) {
         const eduLines = data.education.map((e: any) => {
             const dateRange = `${e.startDate || "?"} - ${e.current ? "Present" : e.endDate || "?"}`;
             const achv = e.achievements?.length > 0 ? `\n  Honors: ${e.achievements.join("; ")}` : "";
             return `- ${e.degree}${e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""} from ${e.institution} (${dateRange})${e.gpa ? `, GPA: ${e.gpa}` : ""}${e.description ? `\n  ${e.description}` : ""}${achv}`;
         }).join("\n");
         sections.push(`## My Education\n${eduLines}`);
     }*/

    // Certifications
    if (data.certifications?.length > 0) {
        const certLines = data.certifications.map((c: any) => {
            return `- ${c.name} by ${c.issuer || "N/A"} (Issued: ${c.issueDate || "N/A"}${c.expiryDate ? `, Expires: ${c.expiryDate}` : ""})${c.description ? `: ${c.description}` : ""}`;
        }).join("\n");
        sections.push(`## My Certifications\n${certLines}`);
    }

    // Services
    /*if (data.services?.length > 0) {
        const svcLines = data.services.map((s: any) => {
            const techs = s.technologies?.map((t: any) => t?.name).filter(Boolean).join(", ");
            const features = s.features?.length > 0 ? `\n  Features: ${s.features.join("; ")}` : "";
            const pricing = s.pricing ? `\n  Pricing: Starting at $${s.pricing.startingPrice || "N/A"} (${s.pricing.priceType || "N/A"})` : "";
            return `- ${s.title}: ${s.shortDescription || ""}${features}${techs ? `\n  Technologies: ${techs}` : ""}${pricing}${s.timeline ? `\n  Timeline: ${s.timeline}` : ""}`;
        }).join("\n");
        sections.push(`## Services I Offer\n${svcLines}`);
    }*/

    // Achievements
    if (data.achievements?.length > 0) {
        const achvLines = data.achievements.map((a: any) => {
            return `- ${a.title}${a.type ? ` (${a.type})` : ""}${a.issuer ? ` — ${a.issuer}` : ""}${a.date ? `, ${a.date}` : ""}${a.description ? `: ${a.description}` : ""}`;
        }).join("\n");
        sections.push(`## My Achievements & Awards\n${achvLines}`);
    }

    return sections.join("\n\n");
}

export async function POST(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { messages, model = "llama-3.3-70b-versatile" } = await req.json();

    // Fetch live portfolio data from Sanity CMS
    const portfolioData = await fetchPortfolioData();
    const portfolioContext = formatPortfolioContext(portfolioData);

    const ownerName = portfolioData.profile
        ? [portfolioData.profile.firstName, portfolioData.profile.lastName].filter(Boolean).join(" ")
        : "the portfolio owner";

    // Build a data-rich system prompt
    const systemPrompt = `You are the AI digital twin of ${ownerName}. You represent them authentically and speak in first person ("I", "my", "me") as if you ARE them.

Here is ALL of your real portfolio data — use ONLY this information to answer questions:

${portfolioContext}

## Rules
- Always speak in **first person** as if you are ${ownerName}
- ONLY answer based on the data above. Do NOT fabricate any details, companies, dates, skills, or projects
- If specific information is not in the data above, say "I haven't documented that yet" or "That's not on my portfolio currently"
- Be friendly, professional, and conversational
- Keep responses **short and crisp** — 2 to 4 sentences max. Focus on the most important highlights only
- Use bullet points sparingly and only when listing 3+ items
- Do NOT dump all information at once. Share the key points and let the user ask for more
- Never mention that you are reading from a database, CMS, or data — just speak naturally as if you personally know this information
- Optionally end with a brief follow-up like "Want to know more?" only when relevant`;

    console.log("- Request Model:", model);

    try {
        const result = await streamText({
            model: groq(model),
            system: systemPrompt,
            messages,
            onFinish: (event) => {
                console.log("Stream finished. Text length:", event.text?.length);
            },
            onError: (error) => {
                console.error("Stream error details:", error);
            }
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Error generating stream:", error);
        return new Response("Error generating response", { status: 500 });
    }
}
