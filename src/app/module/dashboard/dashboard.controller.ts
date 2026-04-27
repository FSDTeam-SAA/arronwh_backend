import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getDashboardOverview() {
    const result = await this.dashboardService.getDashboardOverview();

    return {
      message: 'Dashboard overview retrieved successfully',
      data: result,
    };
  }

  @Get('earning-overview')
  @ApiOperation({ summary: 'Get admin earning overview' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async earningOverview(
    @Query('year') year?: string,
    @Query('type') type?: string,
  ) {
    const filterYear = year ? parseInt(year, 10) : undefined;
    const result = await this.dashboardService.earningOverview(filterYear, type);

    return {
      message: 'Earning overview retrieved successfully',
      data: result,
    };
  }
}
