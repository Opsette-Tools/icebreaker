import { Link } from "react-router-dom";
import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import { OpsetteFooterLogo } from "@/components/opsette-share";

export default function Privacy() {
  return (
    <AppShell>
      <Typography.Title level={2}>Privacy</Typography.Title>

      <Typography.Paragraph>
        Icebreaker doesn't have a server. There's no account, no sign-in, and nothing to log into,
        so there's nowhere for your information to be sent.
      </Typography.Paragraph>

      <Typography.Title level={4}>What's stored</Typography.Title>
      <Typography.Paragraph>
        Which activities you ran, the group size and length you entered, and whether you marked a
        run as worked or flopped. That's kept in your browser's local storage on this device. It
        never leaves the browser, and clearing your site data erases it.
      </Typography.Paragraph>

      <Typography.Title level={4}>What isn't</Typography.Title>
      <Typography.Paragraph>
        Nothing about the people in your meeting. The tool never asks for names, emails, or anything
        about your team. It only ever knows how many people you said were in the meeting.
      </Typography.Paragraph>

      <Typography.Title level={4}>Analytics</Typography.Title>
      <Typography.Paragraph>
        None. No trackers, no cookies, no third-party scripts watching what you pick.
      </Typography.Paragraph>

      <Typography.Paragraph>
        <Link to="/">Back to the tool</Link>
      </Typography.Paragraph>

      <OpsetteFooterLogo />
    </AppShell>
  );
}
