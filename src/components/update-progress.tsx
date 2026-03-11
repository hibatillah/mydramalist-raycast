import { Action, ActionPanel, Form } from "@raycast/api";
import {
  RATE_ASPECTS,
  RATE_VALUES,
  WATCHLIST_STATUS,
} from "../utils/constants";
import { Drama } from "../utils/types";

export function UpdateProgress({ data }: { data: Drama }) {
  return (
    <Form
      navigationTitle={data.title}
      searchBarAccessory={
        <Form.LinkAccessory
          text={`See ${data.type} Detail`}
          target={data.link}
        />
      }
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit Answer"
            onSubmit={(values) => console.log(values)}
          />
        </ActionPanel>
      }>
      <Form.Dropdown id="status" title="Status">
        {WATCHLIST_STATUS.map((status) => (
          <Form.Dropdown.Item
            key={status.value}
            value={status.value}
            title={status.title}
          />
        ))}
      </Form.Dropdown>
      {data.episodes && (
        <Form.Dropdown id="episodes-watched" title="Episodes Watched">
          <Form.Dropdown.Item value="0" title="0" />
          {Array.from({ length: data.episodes }, (_, index) => (
            <Form.Dropdown.Item
              key={index}
              value={String(index + 1)}
              title={`Episode ${index + 1}`}
            />
          ))}
        </Form.Dropdown>
      )}
      <Form.Dropdown id="rate" title="Rate">
        <Form.Dropdown.Item value="0" title="--" />
        {RATE_VALUES.map((rate) => (
          <Form.Dropdown.Item key={rate} value={rate} title={rate} />
        ))}
      </Form.Dropdown>
      <Form.TagPicker
        id="what-you-like-most"
        title="What you like most"
        placeholder="Select aspects you like most">
        {RATE_ASPECTS.map((aspect) => (
          <Form.TagPicker.Item
            key={aspect.value}
            value={aspect.value}
            title={aspect.title}
          />
        ))}
      </Form.TagPicker>
      <Form.TextArea id="notes" title="Notes" />
    </Form>
  );
}
