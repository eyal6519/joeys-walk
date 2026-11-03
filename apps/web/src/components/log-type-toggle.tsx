import type { LogType } from '@walklogger/shared';

import { PinIcon, WalkIcon } from './icons';
import { Segmented } from './ui';

export function LogTypeToggle({
  value,
  onChange,
}: {
  value: LogType;
  onChange: (type: LogType) => void;
}) {
  return (
    <Segmented
      label="Entry type"
      value={value}
      onChange={onChange}
      options={[
        {
          value: 'walk',
          label: (
            <>
              <WalkIcon size={19} /> Walk
            </>
          ),
        },
        {
          value: 'home',
          label: (
            <>
              <PinIcon size={19} /> Found at home
            </>
          ),
        },
      ]}
    />
  );
}
