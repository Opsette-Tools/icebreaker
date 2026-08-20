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
        All of it in your browser on this device, and none of it anywhere else. Which icebreakers
        you ran, with the group size and length you entered and whether you marked each one worked
        or flopped. Your last set of answers to the questions, so the form fills itself in next
        time. The attendee list you type for the picker, so you don't retype your team every week.
        Any question you type to hold on screen. And any cards you add to an activity that has them,
        along with which ones you have already used, so it doesn't hand you the same riddle twice.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Clearing the history in the app removes the run history only, and deliberately leaves the
        rest: your attendee list is your team, not a record of one meeting. Clearing your browser's
        site data erases every one of them.
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
