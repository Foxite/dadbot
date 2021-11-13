import Options from './DB/Options';

export enum Flags {
  IM_RESPONSES = 1 << 0,
  KYS_RESPONSES = 1 << 1,
  SHUT_UP_RESPONSES = 1 << 2,
  WINNING_RESPONSES = 1 << 3
}

export interface SettingsData {
  flags: Flags;
  RNG: number;
  id?: string;
}

const defaultSettings: SettingsData = {
  flags:
    Flags.IM_RESPONSES |
    Flags.KYS_RESPONSES |
    Flags.SHUT_UP_RESPONSES |
    Flags.WINNING_RESPONSES,
  RNG: 1
};

export async function getValueByID(id: string): Promise<SettingsData> {
  let res = await Options.findOne({
    where: {
      id
    }
  });
  if (!res) return { ...defaultSettings, id };
  return { flags: res.flags, RNG: res.RNG, id: res.id };
}

export async function setValueByID(
  id: string,
  value?: SettingsData
): Promise<SettingsData> {
  if (
    !value ||
    (value.flags === defaultSettings.flags && value.RNG === defaultSettings.RNG)
  ) {
    (
      await Options.findOne({
        where: {
          id
        }
      })
    ).destroy();
    return { ...defaultSettings, id };
  } else {
    let res = await Options.findOne({
      where: {
        id
      }
    });
    if (!res) {
      let created = await Options.create({
        id,
        flags: value.flags,
        RNG: value.RNG
      });
      return { flags: created.flags, RNG: created.RNG, id };
    } else {
      let updated = await res.update({ ...value });
      return { flags: updated.flags, RNG: updated.RNG, id };
    }
  }
}

export const StringIsNumber = (value: string) =>
  !isNaN(Number(value)) && isFinite(Number(value));

export function enumToArray(val: any): Array<string> {
  return Object.keys(val)
    .filter(StringIsNumber)
    .map((k: keyof typeof val) => val[k]) as unknown as string[];
}