import { useMemo } from "react";
import { Input } from "antd";
import { parseNames, saveRoster } from "@/lib/storage";

/**
 * The one attendee-list editor, used everywhere the list can be edited: the
 * intake question, the attendees drawer, and the picker inside a running
 * activity. All three read and write the SAME global roster, so they share one
 * field rather than three textareas that could drift apart.
 */

export default function RosterField({
  value,
  onChange,
  minRows = 5,
  maxRows = 14,
  autoFocus = false,
}: {
  value: string;
  onChange: (text: string) => void;
  minRows?: number;
  maxRows?: number;
  autoFocus?: boolean;
}) {
  const names = useMemo(() => parseNames(value), [value]);

  return (
    <>
      {/*
       * Above the field, which is Ant's default position for help text but not
       * where guidance belongs: you decide how to separate the second name
       * BEFORE typing it, and the placeholder that would have said so is gone
       * by then. The count below is different — that is feedback on what you
       * typed, so it reads after.
       */}
      <p className="ice-hint ice-hint--above">
        One name per line, or separated by commas. Optional, and only used when an icebreaker picks
        who goes next or makes pairs.
      </p>
      <Input.TextArea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // Persisted on every keystroke rather than on blur or on submit. The
          // list is shared, so a name typed here should already be there when
          // the picker opens, without anything having to be "saved" first.
          saveRoster(e.target.value);
        }}
        placeholder={"Priya\nMarcus\nDee"}
        autoSize={{ minRows, maxRows }}
        autoFocus={autoFocus}
      />
      {names.length > 0 ? (
        <p className="ice-hint ice-hint--count">
          {names.length} {names.length === 1 ? "attendee" : "attendees"} · shared across every
          icebreaker
        </p>
      ) : null}
    </>
  );
}
