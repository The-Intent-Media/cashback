import Header from "@/components/Header"
import Footer from "@/components/Footer"
import LeadForm from "@/components/LeadForm"
import ExplanationBlock from "@/components/ExplanationBlock"
import { createDirectus, rest, readItems } from "@directus/sdk"
import { notFound } from "next/navigation"


export const metadata = {
  title: "Cashback",
};

export default async function Page({ params }) {
  const client = createDirectus(process.env.CMS_URL, {
    fetchOptions: {
      mode: "cors",
    },
  }).with(rest());

    const landingPages = await client.request(readItems("landingPages", {
      filter: {
        slug: { _eq: params.slug }
      }
    })); 

    if(!landingPages[0]) notFound();

    const slug = params?.slug;

    const landingPage = landingPages[0]

  return (
    <div className="flex flex-col min-h-screen">
      <Header logo={landingPage.logo} title={landingPage?.title} />
      <main className="flex-grow container mx-auto px-4 py-8 items-center flex">
        <div className="grid md:grid-cols-2 gap-8">
          
        <div className="flex flex-col justify-center">
          
            <LeadForm offerId={landingPage.offerId} affiliateId={landingPage.affiliateId} slug={slug} affiliateUrl={landingPage.affiliateUrl} />
          </div>
          <div className="space-y-6">
            
            <p className="text-lg text-muted-foreground">
              {landingPage?.description}
            </p>
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              <ExplanationBlock
                title="Step 1: Fill the Form"
                className={" bg-muted-foreground/5"}
                description="Provide your details in the form to get redirected to the Casino/SportsBook."
              />
              <ExplanationBlock
                title="Step 2: Register"
                className={" bg-muted-foreground/5"}
                description="Create your account at the Casino/SportsBook to participate in the cashback offer."
              />
              <ExplanationBlock
                title="Step 3: Deposit"
                className={"bg-blue-radiant text-white"}
                description="Make your first deposit to start playing and qualify for the cashback."
              />
              <ExplanationBlock
                title="Step 4: Play"
                className={"bg-gold-radiant text-white"}
                description="Enjoy our wide range of games. Your play contributes to your cashback eligibility."
              />
              <div className="md:col-span-2">
                <ExplanationBlock
                  title="Step 5: Receive Cashback"
                  className="bg-green-radiant text-white"
                  description="In 7 days, receive your cashback via PIX or MBWay."
                />
              </div>
            </div>
          </div>
          
        </div>
      </main>
      <Footer title={landingPage?.title} />
    </div>
  )
}