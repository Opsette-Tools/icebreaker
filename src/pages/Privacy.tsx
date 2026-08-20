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
        Three things, all in your browser on this device. Which icebreakers you ran, with the group
        size and length you entered and whether you marked each one worked or flopped. Your last set
        of answers to the three questions, so the form fills itself in next time. And the attendee
        list you type for the picker, so you don't retype your team every week.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Clearing the history in the app removes the first of those and leaves the other two.
        Clearing your browser's site data erases all three.
      </Typography.Paragraph>
      <Typography.Title level={4}>What isn't</Typography.Title>
      <Typography.Paragraph>
        No emails, no contact details, nothing about anyone beyond a first name if you choose to
        type one. The attendee list is optional, it's only there so the picker can say who goes
        next, and it stays on this device. Nothing is uploaded, because there's nowhere to upload it
        to.
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
