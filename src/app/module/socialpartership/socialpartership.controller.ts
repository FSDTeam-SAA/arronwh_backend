import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SocialpartershipService } from './socialpartership.service';
import { CreateSocialpartershipDto } from './dto/create-socialpartership.dto';
import { UpdateSocialpartershipDto } from './dto/update-socialpartership.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';


@ApiTags('socialpartership')
@Controller('socialpartership')
export class SocialpartershipController {
  constructor(
    private readonly socialpartershipService: SocialpartershipService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create socialpartership section' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createSocialpartership(@Body() dto: CreateSocialpartershipDto) {
    const result =
      await this.socialpartershipService.createSocialpartership(dto);
    return { message: 'Socialpartership created successfully', data: result };
  }

  @Post(':id/social-link')
  @ApiOperation({ summary: 'Add social link with icon image upload' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('icon', fileUpload.uploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: { type: 'string', format: 'binary', description: 'Icon image' },
        link: { type: 'string', example: 'https://facebook.com/yoloheat' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async addSocialLink(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('link') link: string,
  ) {
    const result = await this.socialpartershipService.addSocialLink(
      id,
      file,
      link,
    );
    return { message: 'Social link added successfully', data: result };
  }

  @Delete(':id/social-link/:index')
  @ApiOperation({ summary: 'Remove social link by index' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async removeSocialLink(
    @Param('id') id: string,
    @Param('index') index: string,
  ) {
    const result = await this.socialpartershipService.removeSocialLink(
      id,
      parseInt(index),
    );
    return { message: 'Social link removed successfully', data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get all socialparterships' })
  @HttpCode(HttpStatus.OK)
  async findAllSocialparterships() {
    const result =
      await this.socialpartershipService.findAllSocialparterships();
    return { message: 'Socialparterships fetched successfully', data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single socialpartership by id' })
  @HttpCode(HttpStatus.OK)
  async findOneSocialpartership(@Param('id') id: string) {
    const result =
      await this.socialpartershipService.findOneSocialpartership(id);
    return { message: 'Socialpartership fetched successfully', data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update socialpartership by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateSocialpartership(
    @Param('id') id: string,
    @Body() dto: UpdateSocialpartershipDto,
  ) {
    const result = await this.socialpartershipService.updateSocialpartership(
      id,
      dto,
    );
    return { message: 'Socialpartership updated successfully', data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete socialpartership by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteSocialpartership(@Param('id') id: string) {
    const result =
      await this.socialpartershipService.deleteSocialpartership(id);
    return { message: 'Socialpartership deleted successfully', data: result };
  }
}
