import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ChatPromptDto } from './dto/chat-prompt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Booking Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  @ApiOperation({
    summary: 'گفتگو با دستیار هوشمند و رزرو بلیت به زبان محاوره‌ای',
  })
  async chat(@Body() dto: ChatPromptDto, @Req() req: any) {
    const { message } = dto;
    const userId = req.user.id;
    const reply = await this.agentService.processMessage(message, userId);
    return { reply };
  }
}
