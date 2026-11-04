import { getAllMunicipalities, getAllProvinces } from "@aivangogh/ph-address";

export const PHILIPPINES = "Philippines";
export const METRO_MANILA = "Metro Manila";
const BARMM_SPECIAL_GEOGRAPHIC_AREA = "BARMM Special Geographic Area";
const provinceRecords = getAllProvinces();
const provinceNameByCode = new Map(provinceRecords.map((province) => [province.psgcCode, province.name]));
const cityOptionsByProvince = new Map<string, string[]>();
for (const province of provinceRecords) cityOptionsByProvince.set(province.name, []);
cityOptionsByProvince.set(METRO_MANILA, []);
cityOptionsByProvince.set(BARMM_SPECIAL_GEOGRAPHIC_AREA, []);
for (const municipality of getAllMunicipalities()) {
  if (municipality.provinceCode === "1380600000") continue;
  const provinceName = municipality.provinceCode === "1300000000" ? METRO_MANILA
    : municipality.provinceCode === "0990100000" ? "Basilan"
    : municipality.provinceCode === "1999900000" ? BARMM_SPECIAL_GEOGRAPHIC_AREA
    : provinceNameByCode.get(municipality.provinceCode);
  if (provinceName) cityOptionsByProvince.get(provinceName)?.push(municipality.name);
}
for (const cities of cityOptionsByProvince.values()) cities.sort((first, second) => first.localeCompare(second));
export const PHILIPPINE_PROVINCE_OPTIONS = [...provinceRecords.map((province) => province.name), METRO_MANILA, BARMM_SPECIAL_GEOGRAPHIC_AREA].sort((first, second) => first.localeCompare(second));
export const getCityOptions = (province: string) => cityOptionsByProvince.get(province) || [];
