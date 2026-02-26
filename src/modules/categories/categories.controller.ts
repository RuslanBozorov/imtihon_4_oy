import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.dto';
import { Role } from '@prisma/client';
import { CreateCategoriesDto } from './dto/create.dto';
import { UpdateCategoriesDto } from './dto/update.dto';

@ApiBearerAuth()
@Controller('categories')
@UseGuards(AuthGuard, RoleGuard)
export class CategoriesController {
    constructor(private readonly categoryService:CategoriesService) {}
    @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Get('all')
    getAllCategory(){
        return this.categoryService.getAllCategorys()
    }

    @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Get('one/category/:id')
    getOneCategory(@Param('id',ParseIntPipe) id : number){
        return this.categoryService.getOneCategory(id)
    }


     @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Post()
    createCategory(@Body() payload : CreateCategoriesDto){
        return this.categoryService.createCategory(payload)
    }


    @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Patch('update/:id')
    updateCategory(@Param('id',ParseIntPipe) id : number, @Body() payload:UpdateCategoriesDto){
        return this.categoryService.updateCategory(id,payload)
    }


    @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Delete('delete/:id')
    deleteCategory(@Param('id',ParseIntPipe) id:number){
        return this.categoryService.deleteCategory(id)
    }    
}
