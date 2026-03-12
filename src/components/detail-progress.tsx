import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { updateProgress } from "../lib/actions";
import { RATE_ASPECTS, RATE_VALUES, WATCHLIST_STATUS } from "../lib/constants";
import { Drama, ProgressForm, WatchlistStatus } from "../lib/types";

export function DetailProgress({ data }: { data: Drama }) {
  const { pop } = useNavigation();

  const { handleSubmit, itemProps } = useForm<ProgressForm>({
    onSubmit: async (values) => {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Updating progress",
      });

      try {
        await updateProgress(values);
        pop();

        toast.style = Toast.Style.Success;
        toast.title = "Progress updated";
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed to update progress";
        toast.message = "Please try again";
      }
    },
    validation: {
      status: FormValidation.Required,
      episodesWatched: FormValidation.Required,
      rate: FormValidation.Required,
    },
    initialValues: {
      status: data.watchedStatus,
      episodesWatched: data.episodesWatched?.toString() ?? "0",
      rate: data.score?.toString() ?? "0",
      whatYouLikeMost: data.tags ?? [],
      notes: "",
    },
  }); 

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
          <Action.SubmitForm title="Update Watchlist" onSubmit={handleSubmit} />
        </ActionPanel>
      }>
      <Form.Dropdown title="Status" {...itemProps.status}>
        {WATCHLIST_STATUS.map((status) => (
          <Form.Dropdown.Item
            key={status.value}
            value={status.value}
            title={status.title}
          />
        ))}
      </Form.Dropdown>
      {data.episodes && (
        <Form.Dropdown title="Episodes Watched" {...itemProps.episodesWatched}>
          <Form.Dropdown.Item value="0" title="0" />
          {Array.from({ length: data.episodes }, (_, index) => (
            <Form.Dropdown.Item
              key={index}
              value={String(index + 1)}
              title={String(index + 1)}
            />
          ))}
        </Form.Dropdown>
      )}
      <Form.Dropdown title="Rate" {...itemProps.rate}>
        <Form.Dropdown.Item value="0" title="--" />
        {RATE_VALUES.map((rate) => (
          <Form.Dropdown.Item key={rate} value={rate} title={rate} />
        ))}
      </Form.Dropdown>
      <Form.TagPicker
        title="What you like most"
        placeholder="Select aspects you like most"
        {...itemProps.whatYouLikeMost}>
        {RATE_ASPECTS.map((aspect) => (
          <Form.TagPicker.Item
            key={aspect.value}
            value={aspect.value}
            title={aspect.title}
          />
        ))}
      </Form.TagPicker>
      <Form.TextArea title="Notes" {...itemProps.notes} />
    </Form>
  );
}
