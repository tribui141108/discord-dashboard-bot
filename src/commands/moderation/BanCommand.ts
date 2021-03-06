import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { getRepository, Repository } from 'typeorm';
import { ModerationLog } from '../../typeorm/entities/ModerationLog';

export default class KickCommand extends BaseCommand {
  constructor(private readonly modLogRepository: Repository<ModerationLog> = getRepository(ModerationLog)) {
    super('ban', 'moderation', 'Bans a user from a server', []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const [memberId, ...reason] = args;
    if (!memberId) {
      message.reply('❌ You must provide a member ID!')
      return;
    };

    try {
      const member = await message.guild?.members.fetch(memberId)!;
      await member.ban({ reason: reason.join(' ') })
      message.reply(`✅ <@${memberId}> has been banned!\n> Reason: ${reason.join(' ') !== '' ? reason.join(' ') : 'No reason provided'}`);
      const modLog = this.modLogRepository.create({
        guildId: message.guildId!,
        memberId: memberId,
        issuedBy: message.author.id,
        reason: reason.join(' ') !== '' ? reason.join(' ') : 'No reason provided',
        issuedOn: new Date(),
        type: 'ban',
      });
      await this.modLogRepository.save(modLog);
    } catch (error) {
      console.log(error);
    }
  }
}