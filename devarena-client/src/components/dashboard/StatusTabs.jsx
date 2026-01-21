import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StatusTabs({ status, onChange }) {
  return (
    <Tabs value={status ?? "ALL"} onValueChange={onChange}>
      <TabsList className="bg-muted">
        <TabsTrigger value="ALL">All</TabsTrigger>
        <TabsTrigger value="LIVE">Live</TabsTrigger>
        <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
        <TabsTrigger value="ENDED">Ended</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
