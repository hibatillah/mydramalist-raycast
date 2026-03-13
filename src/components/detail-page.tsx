import {
  Action,
  ActionPanel,
  Detail,
  getPreferenceValues,
  Icon,
  Keyboard,
} from "@raycast/api";
import { Drama } from "../lib/types";
import { DetailProgress } from "./detail-progress";

function ItemActions({ data }: { data: Drama }) {
  const preferences = getPreferenceValues<Preferences>();
  const primaryAction = preferences.detailPrimaryAction;

  const priorityActions = {
    "open-in-browser": (
      <Action.OpenInBrowser title="Open in Browser" url={data.link} />
    ),
    "add-to-watchlist": (
      <Action.Push
        icon={Icon.PlusCircle}
        title="Add to Watchlist"
        target={<DetailProgress data={data} />}
      />
    ),
  };

  const orderedPriorityActions = (
    Object.keys(priorityActions) as (keyof typeof priorityActions)[]
  )
    .toSorted((a, b) =>
      a === primaryAction ? -1 : b === primaryAction ? 1 : 0,
    )
    .map((k) => priorityActions[k]);

  return (
    <ActionPanel>
      {orderedPriorityActions}
      <ActionPanel.Section>
        <Action.CopyToClipboard
          title="Copy Page Link"
          content={data.link}
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
        <Action.CopyToClipboard title="Copy Title" content={data.title} />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

export function DetailDrama({ data }: { data: Drama }) {
  const markdown = `
  # ${data.title}

  Ratings: ${data.score ?? "N/A"}\n
  Ranked: ${data.ranked ? `#${data.ranked}` : "N/A"}\n
  Popularity: ${data.popularity ? `#${data.popularity}` : "N/A"}\n
  Watchers: ${data.watchers ?? "N/A"}\n
  Cast: ${data.cast.slice(0, 6).join(", ") ?? "N/A"}

  ${data.description ?? "No description available"}
  `;

  return (
    <Detail
      markdown={markdown}
      navigationTitle={data.title}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text={data.type} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.TagList title="Genres">
            {data.genres.map((genre) => (
              <Detail.Metadata.TagList.Item key={genre} text={genre} />
            ))}
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Country" text={data.country} />
          <Detail.Metadata.Label
            title="Duration"
            text={data.duration ?? "N/A"}
          />
          {data.type !== "movie" && (
            <Detail.Metadata.Label
              title="Episodes"
              text={data.episodes?.toString() ?? "N/A"}
            />
          )}
          {data.aired ? (
            <Detail.Metadata.Label title="Aired" text={data.aired ?? "N/A"} />
          ) : (
            <Detail.Metadata.Label title="Airs" text={data.airs ?? "N/A"} />
          )}
          {data.type !== "movie" && data.airedOn && (
            <Detail.Metadata.Label
              title="Aired On"
              text={data.airedOn ?? "N/A"}
            />
          )}
          <Detail.Metadata.Label
            title="Original Network"
            text={data.originalNetwork ?? "N/A"}
          />
          {data.externalLink && data.externalLink.length > 0 && (
            <>
              <Detail.Metadata.Separator />
              {data.externalLink.map((item) => (
                <Detail.Metadata.Link
                  key={item.title}
                  title={item.title}
                  target={item.link}
                  text={item.text}
                />
              ))}
            </>
          )}
        </Detail.Metadata>
      }
      actions={<ItemActions data={data} />}
    />
  );
}
