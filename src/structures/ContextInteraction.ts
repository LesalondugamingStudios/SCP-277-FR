/*
 * Copyright (C) 2023  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import { ApplicationCommandOptionType, Channel, CommandInteraction, CommandInteractionOption, Guild, GuildMember, Message, Role, User, TextBasedChannel, ApplicationCommandOptionData, ApplicationCommandSubCommandData, CommandInteractionOptionResolver, ChatInputCommandInteraction, MessageEditOptions } from 'discord.js';
import { ApplicationCommandSubGroupData } from 'discord.js/typings';
import { TFunction } from 'i18next';
import { AnyOption, CommandReplyOption } from '../types';
import { WanderersClient } from './Client';
import { Command } from './Command';
import langs from "../util/language.json"

export class ContextInteraction {
  client: WanderersClient;
  id: string;
  command: Command;
  user: User;
  member?: GuildMember;
  channel: TextBasedChannel | null;
  guild: Guild | null;
  replyMessage: Message | null;
  deferred: boolean;
  class: ChatInputCommandInteraction | Message;
  options: ContextInteractionOptionResolver | CommandInteractionOptionResolver;

  constructor(interaction: ChatInputCommandInteraction | Message, command: Command) {
    this.client = interaction.client;
    this.id = interaction.id;
    this.command = command;

    if (interaction instanceof ChatInputCommandInteraction) this.user = interaction.user;
    else this.user = interaction.author;
    if (interaction.member instanceof GuildMember) this.member = interaction.member;
    this.channel = interaction.channel;
    this.guild = interaction.guild;

    this.replyMessage = null;
    this.deferred = false;

    this.class = interaction;
    if(interaction instanceof ChatInputCommandInteraction) this.options = interaction.options as unknown as CommandInteractionOptionResolver
    else {
      let buildOpt = this.buildOptions();
      if(!(buildOpt instanceof ContextInteractionOptionResolver)) throw "Error sent to user"
      this.options = buildOpt
    }
  }

  buildOptions() {
    return ContextInteractionOptionResolver.create(this.client, this);
  }

  async reply(options: CommandReplyOption | string): Promise<Message | undefined | null> {
    if (typeof options === 'string') options = { content: options };
    if (!(this.class instanceof Message) && (this.class.replied || this.class.deferred)) {
      if (this.channel) return this.channel.send(options);
      else console.warn(new TypeError('Cannot reply to this message'));
    }

    this.replyMessage = (await this.class.reply(options)) as Message || null;

    return this.replyMessage;
  }

  async deferReply(options: CommandReplyOption = {}): Promise<Message | undefined | null> {
    this.deferred = true;
    if (this.class instanceof Message) {
      const message = await this.reply({ content: `Loading ...` });
      this.replyMessage = message ?? null;
      return this.replyMessage;
    } else {
      if(!options.fetchReply) options.fetchReply = true
      const message = (await this.class.deferReply(options)) as unknown as Message
      this.replyMessage = message ?? null
      return this.replyMessage
    }
  }

  async editReply(options: MessageEditOptions): Promise<Message | undefined | null> {
    if (!this.replyMessage) throw new SyntaxError('The reply must be sent before editing it.');
    if (this.class instanceof Message) {
      if (!options.content && this.deferred) options.content = null;
      return await this.replyMessage.edit(options);
    } else {
      const message = await this.class.editReply(options);
      return message instanceof Message ? message : null;
    }
  }

  translate(key: string, args: {[key: string]: any} = {}): string {
    let language = this.client.i18n.get(this.getLang())
    let en = this.client.i18n.get("en")
    if (!language) language = en
    if (!language) return "um, well, no texts here. you should contact us on our support server https://discord.gg/NyUukwA"

    let translation = language(key, args)
    if (!translation || translation === key.split(":")[1]) {
      this.client.log(`Key inconnu ${this.getLang()} ${key} ${args}`, "warn")
      if (en) translation = en(key, args)
      if (!translation || translation === key.split(":")[1]) translation = (this.client.i18n.get("fr") as TFunction)(key, args)
    }

    return translation
  }

  getLang() {
    if (!this.guild?.db || !this.guild.db.defaultBranch) return "en"
    return langs[this.guild.db.defaultBranch].i18n || "en"
  }

  inGuild(): boolean {
    if (this.guild) return true;
    else return false;
  }
}

export class ContextInteractionOptionResolver {
  client: WanderersClient;
  private _group: string | null;
  private _subcommand: string | null;
  private _hoistedOptions:
    | ResolvedOption[]
    | ReadonlyArray<ResolvedOption | CommandInteractionOption>;
  readonly data: ReadonlyArray<ResolvedOption | CommandInteractionOption>;

  private constructor(client: WanderersClient, options: ResolvedOption[] | ReadonlyArray<ResolvedOption> | readonly CommandInteractionOption[]) {
    this.client = client;

    this._group = null;
    this._subcommand = null;
    this._hoistedOptions = options;

    if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.SubcommandGroup) {
      this._group = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options ?? [];
    }

    if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.Subcommand) {
      this._subcommand = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options ?? [];
    }

    this.data = Object.freeze([...options]);
  }

  static create(client: WanderersClient, interaction: ContextInteraction) {
    let options = ContextInteractionOptionResolver.generateOptions(interaction);
    if (options.error) return interaction.reply(`**:x: | ${interaction.translate(`misc:command_errors.${options.text?.toLowerCase()}`, { intended: options.intended, given: options.given })}**`)
    else var optionsdata = options.result;
    if (!optionsdata) throw TypeError('Invalid data provided to build DreeperCommandInteractionOptionResolver');
    return new this(client, optionsdata);
  }

  static generateOptions(interaction: ContextInteraction): generateOptionsResult {
    if (interaction.class instanceof Message && interaction.client.config.prefix) {
      const { content } = interaction.class;
      let args = content.slice(interaction.client.config?.prefix.length).split(/ +/);
      args.shift();

      let hoisted: ApplicationCommandOptionData[] = interaction.command.options;
      let i: number = 0;

      if (hoisted[0]?.type === ApplicationCommandOptionType.SubcommandGroup) {
        let subcommandgrouplist = hoisted.map(s => s.name);
        if (!args[i]) return { error: true, text: 'INVALID_SUBCOMMANDGROUP', intended: subcommandgrouplist.join(", "), given: '[void]' };

        let subcommandgroup: ApplicationCommandSubGroupData | undefined = hoisted.find(o => o.name === args[i].toLowerCase()) as any;
        if (!subcommandgroup || !subcommandgroup.options) return { error: true, text: 'INVALID_SUBCOMMANDGROUP', intended: subcommandgrouplist.join(", "), given: args[i] };

        hoisted = subcommandgroup.options;
        i++;

        let subcommand = ContextInteractionOptionResolver._extractSubCommand({ hoisted, args, interaction }, i);
        if (subcommand.error) return subcommand;
        else var subgcommanddata = subcommand.result;
        return { result: [{
              type: ApplicationCommandOptionType.SubcommandGroup,
              name: subcommandgroup.name,
              options: subgcommanddata,
            }],
        };
      }

      if (hoisted[0]?.type === ApplicationCommandOptionType.Subcommand) {
        let subcommand = ContextInteractionOptionResolver._extractSubCommand({ hoisted, args, interaction }, i);

        if (subcommand.error) return subcommand;
        else var subcommanddata = subcommand.result;

        return { result: subcommanddata };
      }

      let options = ContextInteractionOptionResolver._extract({ hoisted, args, interaction });
      if (options.error) return options;
      else var optionsdata = options.result;

      return { result: optionsdata };
    } else if (interaction.class instanceof CommandInteraction) {
      return { result: interaction.class.options.data };
    } else {
      throw new TypeError('Unknown class used to build a DreeperCommandInteractionOptionResolver');
    }
  }

  static _extractSubCommand(data: extractOptions, i = 0): extractResult {
    let subcommandlist = data.hoisted.map(s => s.name);
    if (!data.args[i]) return { error: true, text: 'INVALID_SUBCOMMAND', intended: subcommandlist.join(", "), given: '[void]' };

    let subcommand: ApplicationCommandSubCommandData | undefined = data.hoisted.find(o => o.name === data.args[i].toLowerCase()) as any;
    if (!subcommand) return { error: true, text: 'INVALID_SUBCOMMAND', intended: subcommandlist.join(", "), given: data.args[i] };

    if(subcommand.options){
      data.hoisted = subcommand.options;
      i++;

      let options = ContextInteractionOptionResolver._extract(data, i);
      if (options.error) return options;
      else var optionsdata = options.result;
      return { result: [{ type: ApplicationCommandOptionType.Subcommand, name: subcommand.name, options: optionsdata }] };
    }

    return { result: [{ type: ApplicationCommandOptionType.Subcommand, name: subcommand.name }] }
  }

  static _extract(data: extractOptions, i = 0): extractResult {
    let options: ResolvedOption[] = [];
    for (let j = 0; j < data.hoisted.length; j++, i++) {
      let arg = data.args[i];
      let commandoption: AnyOption = data.hoisted[j] as any;

      if (!arg && commandoption.required) {
        return { error: true, text: 'MISSING_ARG', intended: commandoption.name };
      } else if (!arg) continue;

      let value;
      if (commandoption.type === ApplicationCommandOptionType.Number || commandoption.type === ApplicationCommandOptionType.Integer) {
        value = parseInt(arg);
        if (isNaN(value)) return { error: true, text: 'INVALID_NUMBER', given: arg };
        if (commandoption.minValue) if (value < commandoption.minValue) return { error: true, text: 'INVALID_NUMBER_SMALL', given: arg, intended: commandoption.minValue };
        if (commandoption.maxValue) if (value < commandoption.maxValue) return { error: true, text: 'INVALID_NUMBER_BIG', given: arg, intended: commandoption.maxValue };
      } else if (commandoption.type === ApplicationCommandOptionType.Boolean) {
        if (arg.toLowerCase() !== 'true' && arg.toLowerCase() !== 'false') return { error: true, text: 'INVALID_BOOLEAN', given: arg };
        value = arg.toLowerCase() === 'true';
      } else if (commandoption.type === ApplicationCommandOptionType.String) {
        if (commandoption._isLong) {
          value = data.args.splice(i).join(' ');
          options.push({ name: commandoption.name, type: commandoption.type, value });
          break;
        } else value = arg;
      } else {
        value = arg;
      }

      if (commandoption.choices) {
        let selected = null;
        for (let choice of commandoption.choices) {
          if (selected) break;
          if (choice.name.toLowerCase() === (typeof value === 'string' ? value.toLowerCase() : value) || (typeof choice.value === 'string' ? choice.value.toLowerCase() : choice.value) === (typeof value === 'string' ? value.toLowerCase() : value)) selected = choice.value;
        }
        if (!selected) return { error: true, text: 'ARG_CHOICE_INVALID', given: arg, intended: commandoption.choices.map(c => c.name).join(', ') };
        else value = selected;
      }

      options.push({ name: commandoption.name, type: commandoption.type, value });
    }

    return { result: options };
  }

  get(name: string, required = false): ResolvedOption | CommandInteractionOption | null {
    const option = this._hoistedOptions.find(opt => opt.name === name);
    if (!option) {
      if (required) {
        throw new TypeError(`COMMAND_INTERACTION_OPTION_NOT_FOUND ${name}`);
      }
      return null;
    }
    return option;
  }

  _getTypedOption(name: string, type: ApplicationCommandOptionType, required: boolean): ResolvedOption | CommandInteractionOption | null {
    const option = this.get(name, required);
    if (!option) {
      return null;
    } else if (option.type !== type) {
      throw new TypeError(`COMMAND_INTERACTION_OPTION_TYPE ${name} ${option.type} ${type}`);
    }
    return option;
  }

  getSubcommand(required = true): string | null {
    if (required && !this._subcommand) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_NO_SUB_COMMAND');
    }
    return this._subcommand;
  }

  getSubcommandGroup(required = true): string | null {
    if (required && !this._group) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_NO_SUB_COMMAND_GROUP');
    }
    return this._group;
  }

  getBoolean(name: string, required = false): boolean | null {
    const option = this._getTypedOption(name, ApplicationCommandOptionType.Boolean, required);
    return (option?.value as boolean);
  }

  getString(name: string, required = false): string | null {
    const option = this._getTypedOption(name, ApplicationCommandOptionType.String, required);
    return (option?.value as string);
  }

  getInteger(name: string, required = false): number | null {
    const option = this._getTypedOption(name, ApplicationCommandOptionType.Integer, required);
    return (option?.value as number);
  }

  getNumber(name: string, required = false): number | null {
    const option = this._getTypedOption(name, ApplicationCommandOptionType.Number, required);
    return (option?.value as number);
  }
}

interface generateOptionsResult {
  error?: boolean;
  text?:
    | 'INVALID_SUBCOMMANDGROUP'
    | 'INVALID_SUBCOMMAND'
    | 'MISSING_ARG'
    | 'INVALID_NUMBER'
    | 'INVALID_NUMBER_SMALL'
    | 'INVALID_NUMBER_BIG'
    | 'INVALID_BOOLEAN'
    | 'ARG_CHOICE_INVALID';
  intended?: unknown;
  given?: unknown;
  result?:
    | ResolvedOption[]
    | readonly ResolvedOption[]
    | readonly CommandInteractionOption[];
}

interface extractResult extends generateOptionsResult {
  result?: ResolvedOption[];
}

interface extractOptions {
  interaction: ContextInteraction;
  hoisted: ApplicationCommandOptionData[];
  args: string[];
}

interface ResolvedOption {
  type: ApplicationCommandOptionType;
  name: string;
  value?: string | number | boolean | User | Channel | Role;
  member?: GuildMember;
  options?: ResolvedOption[];
}
