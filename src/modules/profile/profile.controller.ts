import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ProfileService } from "./profile.service";
import { CreateProfileDto, UpdateProfileDto } from "./dto/profile.dto";
import { Roles } from "src/common/decorators/role.dto";
import { AuthGuard } from "src/common/guards/jwt.auth.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { Role } from "@prisma/client";

@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ===============>getAllProfiles
  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Get('all')
  getAllProfiles(){
    return this.profileService.getAllProfiles()
  }

  // ===============>getMyProfile
  @ApiOperation({
    summary:`get my profile`
  })
  @UseGuards(AuthGuard)
  @Get('me')
  getMyProfile(@Req() req : any){
    return this.profileService.getMyProfile(req.user)
  }

  // ===============>getOneProfile
  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Get('single/:id')
  getOneProfile(@Param('id',ParseIntPipe) id:number){
    return this.profileService.getOneProfile(id)
  }

  // ===============>updateMyProfile
  @ApiOperation({
    summary:`update my profile`
  })
  @UseGuards(AuthGuard)
  @Patch('update/my')
  updateMyProfile(@Req() req:any,@Body() payload:UpdateProfileDto){
    return this.profileService.updateMyProfile(req.user,payload)
  }

  // ===============>updateProfile
  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Patch('update/:id')
  updateProfile(@Param('id',ParseIntPipe) id:number,@Body() payload:UpdateProfileDto){
    return this.profileService.updateProfile(id,payload)
  }

  // ===============>createMyProfile
  @ApiOperation({
    summary:`create my profile`
  })
  @UseGuards(AuthGuard)
  @Post('create/my')
  createMyProfile(@Req() req : any,@Body() payload : CreateProfileDto){
    return this.profileService.createMyProfile(req.user,payload)
  }


  // ========>CreateProfile
  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Post('create/:id')
  createProfile(@Param('id',ParseIntPipe) id : number,@Body() payload : CreateProfileDto){
    return this.profileService.createProfile(id,payload)
  }

  // ===============>deleteProfile
  @ApiOperation({
    summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @Delete('delete/:id')
  deleteProfile(@Param('id',ParseIntPipe) id:number){
    return this.profileService.deleteProfile(id)
  }
}
