import { Link } from "react-router-dom";
import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import { OpsetteFooterLogo } from "@/components/opsette-share";

export default function About() {
  return (
    <AppShell>
      <Typography.Title level={2}>About Icebreaker</Typography.Title>

      <Typography.Paragraph>
        Icebreakers usually die in the first ninety seconds. Someone reads an activity off a blog
        post, explains the rules while still skimming them, forgets to answer first, and then
        watches eight muted squares wait for somebody else to go. The activity was fine. The run was
        the problem.
      </Typography.Paragraph>

      <Typography.Paragraph>
        Every facilitation guide already says what to do about it. Go first yourself, say the rules
        and the time limit out loud, ask the closing question. Nobody follows that advice, because
        it arrives as four paragraphs of prose and the meeting started two minutes ago. This tool
        makes it something you can run instead of something you have to read.
      </Typography.Paragraph>

      <Typography.Title level={4}>How it works</Typography.Title>
      <Typography.Paragraph>
        You answer a few questions about the meeting: how many people, how long you've got, how well
        they know each other, and where it sits in the meeting. It hands you one activity instead of
        a grid of thirty, which is what the blog post already was. You get the steps, the line to
        open with, what to watch out for, and the question to close on, all on one page you can read
        or paste into a deck. Anything that has to run live, a timer, a question to hold on screen,
        a way to pick who goes next, opens in a separate window you can share.
      </Typography.Paragraph>

      <Typography.Title level={4}>Why some icebreakers get eye-rolled</Typography.Title>
      <Typography.Paragraph>
        It's almost never the activity. It's a mismatch. Something that asks people to share their
        proudest moment, handed to a group that met on Monday. Every activity here is rated on how
        much self-disclosure it actually asks for, and that third question about how well the group
        knows each other quietly sets the ceiling. You never see the rating. You just stop getting
        handed activities that are too much for the room.
      </Typography.Paragraph>

      <Typography.Title level={4}>Built for video meetings</Typography.Title>
      <Typography.Paragraph>
        Anything needing a shared physical room was cut, not included with an asterisk. No standing
        in a circle, no Human Knot. Some activities work in a video meeting as-is; the rest come
        with the rewrite that makes them work, written out, not left to you at 8:58am.
      </Typography.Paragraph>

      <Typography.Title level={4}>Where your data lives</Typography.Title>
      <Typography.Paragraph>
        In your browser, on this device. There's no account and no server. See{" "}
        <Link to="/privacy">Privacy</Link> for the specifics.
      </Typography.Paragraph>

      <Typography.Paragraph>
        <Link to="/">Back to the tool</Link>
      </Typography.Paragraph>

      <OpsetteFooterLogo />
    </AppShell>
  );
}
