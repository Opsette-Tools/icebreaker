import { Link } from "react-router-dom";
import { Typography } from "antd";
import AppShell from "@/components/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <Typography.Title level={2}>Nothing here</Typography.Title>
      <Typography.Paragraph>
        That page doesn't exist. <Link to="/">Start over</Link>.
      </Typography.Paragraph>
    </AppShell>
  );
}
