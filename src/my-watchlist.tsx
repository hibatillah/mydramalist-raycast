import { Action, ActionPanel, Icon, List } from "@raycast/api";
import removeFromWatchlist from "./actions/watchlist";
import { DetailDrama } from "./components/detail-drama";
import { UpdateProgress } from "./components/update-progress";
import { DRAMAS } from "./utils/data";

function Filter() {
  return (
    <List.Dropdown tooltip="Filter Search" storeValue>
      <List.Dropdown.Item value="watching" title="Currently Watching" />
      <List.Dropdown.Item value="completed" title="Completed" />
      <List.Dropdown.Item value="on-hold" title="On Hold" />
      <List.Dropdown.Item value="dropped" title="Dropped" />
      <List.Dropdown.Item value="plan-to-watch" title="Plan to Watch" />
      <List.Dropdown.Item value="undecided" title="Undecided" />
      <List.Dropdown.Item value="not-interested" title="Not Interested" />
    </List.Dropdown>
  );
}

export default function Command() {
  return (
    <List
      searchBarPlaceholder="Find dramas, movies, actors and more..."
      searchBarAccessory={<Filter />}>
      {DRAMAS.map((item) => (
        <List.Item
          key={item.id}
          icon={item.icon}
          title={item.title}
          subtitle={item.airedYear?.toString() ?? ""}
          accessories={[
            { icon: Icon.Text, text: `Ratings ${item.score} • Progress 8/12` },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Update Progress"
                target={<UpdateProgress data={item} />}
                icon={Icon.Pencil}
              />
              <Action.Push
                title="See Detail"
                target={<DetailDrama data={item} />}
                icon={Icon.Info}
              />
              <Action.OpenInBrowser
                title="Open Detail in Browser"
                url={item.link}
              />
              <ActionPanel.Section>
                <Action.CopyToClipboard
                  title="Copy Title"
                  content={item.title}
                />
                <Action.CopyToClipboard
                  title="Copy Page Link"
                  content={item.link}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action.OpenInBrowser
                  title="Open Watchlist in Browser"
                  url="https://mydramalist.com/dramalist"
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  title="Remove from Watchlist"
                  onAction={async () => await removeFromWatchlist(item)}
                  icon={Icon.XMarkCircle}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl"], key: "backspace" }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
