import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { DetailDrama } from "./components/detail-drama";
import { DRAMAS } from "./utils/data";

function Filter() {
  return (
    <List.Dropdown tooltip="Filter Search" storeValue>
      <List.Dropdown.Section title="Type">
        <List.Dropdown.Item value="drama" title="Drama" />
        <List.Dropdown.Item value="movie" title="Movie" />
        <List.Dropdown.Item value="show" title="TV Show" />
      </List.Dropdown.Section>
      <List.Dropdown.Section title="Status">
        <List.Dropdown.Item value="ongoing" title="Ongoing" />
        <List.Dropdown.Item value="completed" title="Completed" />
        <List.Dropdown.Item value="upcoming" title="Upcoming" />
      </List.Dropdown.Section>
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
          subtitle={item.cast.slice(0, 3).join(", ")}
          accessories={[
            {
              icon: Icon.Text,
              text: `${item.type} • ${item.airedYear} ${item.type !== "movie" ? `• ${item.episodes} episodes` : ""}`,
            },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="See Detail"
                target={<DetailDrama data={item} />}
                icon={Icon.Info}
              />
              <Action.OpenInBrowser title="Open in Browser" url={item.link} />
              <ActionPanel.Section>
                <Action.CopyToClipboard
                  title="Copy Page Link"
                  content={item.link}
                />
                <Action.CopyToClipboard
                  title="Copy Title"
                  content={item.title}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
