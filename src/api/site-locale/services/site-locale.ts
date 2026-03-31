type SiteLocale = {
  code: string;
  isDefault: boolean;
  name: string;
};

export default () => ({
  async list(): Promise<SiteLocale[]> {
    const localesService = strapi.plugin('i18n').service('locales');
    const locales = await localesService.find();
    const defaultLocale = await localesService.getDefaultLocale();

    return locales
      .map((locale) => ({
        code: locale.code,
        isDefault: locale.code === defaultLocale,
        name: locale.name || locale.code.toUpperCase(),
      }))
      .sort((left, right) => {
        if (left.isDefault !== right.isDefault) {
          return left.isDefault ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      });
  },
});
