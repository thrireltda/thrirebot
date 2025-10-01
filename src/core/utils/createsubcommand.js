import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export default async function(name, description, options = null)
{
    const command = new SlashCommandSubcommandBuilder();
    if (name) command.setName(name);
    if (description) command.setDescription(description);
    if (options) for (const option of options) {
            switch (option.type) {
                case String:
                    command.addStringOption(opt =>
                    {
                        opt.setName(option.name);
                        opt.setDescription(option.description);
                        opt.setAutocomplete(option.autocomplete);
                        opt.setRequired(option.required);
                        return opt;
                    });
                    break;
            }
        }
    return command;
}