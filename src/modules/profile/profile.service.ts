import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateProfileDto, UpdateProfileDto } from "./dto/profile.dto";
import { PrismaService } from "src/core/database/prisma.service";

@Injectable()
export class ProfileService{
  constructor(private prisma : PrismaService){}

  private getAvatarUrl(avatar:string | null){
    return avatar ? `http://localhost:3000/files/${avatar}` : null
  }

  // ===============>getAllProfiles
  async getAllProfiles(){
    const profiles = await this.prisma.profiles.findMany({
      orderBy:{ created_at:"desc" },
      select:{
        id:true,
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        update_at:true,
        user:{
          select:{
            username:true,
            email:true,
            avatar:true
          }
        }
      }
    })

    if(profiles.length === 0) throw new NotFoundException("Profillar topilmadi")

    return{
      success:true,
      message:"Barcha profillar",
      data:profiles.map((profile)=>({
        ...profile,
        avatar_url:this.getAvatarUrl(profile.user.avatar)
      }))
    }
  }

  // ===============>getMyProfile
  async getMyProfile(user:{id:number}){
    const profile = await this.prisma.profiles.findFirst({
      where:{ user_id:user.id },
      select:{
        id:true,
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        update_at:true,
        user:{
          select:{
            username:true,
            email:true,
            avatar:true
          }
        }
      }
    })

    if(!profile) throw new NotFoundException("Profil topilmadi")

    const avatar_url = this.getAvatarUrl(profile.user.avatar)

    return{
      success:true,
      message:"Mening profilim",
      data:{
        ...profile,
        avatar_url
      }
    }
  }

  // ===============>getOneProfile
  async getOneProfile(id:number){
    const profile = await this.prisma.profiles.findFirst({
      where:{ user_id:id },
      select:{
        id:true,
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        update_at:true,
        user:{
          select:{
            username:true,
            email:true,
            avatar:true
          }
        }
      }
    })

    if(!profile) throw new NotFoundException("Profil topilmadi")

    const avatar_url = this.getAvatarUrl(profile.user.avatar)

    return{
      success:true,
      message:"Profil topildi",
      data:{
        ...profile,
        avatar_url
      }
    }
  }

  // ===============>updateProfile
  async updateProfile(id:number,payload:UpdateProfileDto){
    const existProfile = await this.prisma.profiles.findFirst({
      where:{ user_id:id },
    })

    if(!existProfile) throw new NotFoundException("Profil topilmadi")

    const data:any = {}

    if(typeof payload.full_name === "string" && payload.full_name.trim() !== ""){
      data.full_name = payload.full_name.trim()
    }

    if(payload.phone !== undefined){
      if(payload.phone === null){
        data.phone = null
      }else if(typeof payload.phone === "string"){
        data.phone = payload.phone.trim() !== "" ? payload.phone.trim() : null
      }
    }

    if(payload.country !== undefined){
      if(payload.country === null){
        data.country = null
      }else if(typeof payload.country === "string"){
        data.country = payload.country.trim() !== "" ? payload.country.trim() : null
      }
    }

    if(Object.keys(data).length === 0){
      throw new BadRequestException("Yangilash uchun ma'lumot yuborilmadi")
    }

    const profile = await this.prisma.profiles.update({
      where:{ id:existProfile.id },
      data,
      select:{
        id:true,
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        update_at:true,
        user:{
          select:{
            username:true,
            email:true,
            avatar:true
          }
        }
      }
    })

    return{
      success:true,
      message:"Profil yangilandi",
      data:{
        ...profile,
        avatar_url:this.getAvatarUrl(profile.user.avatar)
      }
    }
  }

  // ===============>updateMyProfile
  async updateMyProfile(user:{id:number},payload:UpdateProfileDto){
    const existProfile = await this.prisma.profiles.findFirst({
      where:{ user_id:user.id },
    })

    if(!existProfile) throw new NotFoundException("Profil topilmadi")

    const data:any = {}

    if(typeof payload.full_name === "string" && payload.full_name.trim() !== ""){
      data.full_name = payload.full_name.trim()
    }

    if(payload.phone !== undefined){
      if(payload.phone === null){
        data.phone = null
      }else if(typeof payload.phone === "string"){
        data.phone = payload.phone.trim() !== "" ? payload.phone.trim() : null
      }
    }

    if(payload.country !== undefined){
      if(payload.country === null){
        data.country = null
      }else if(typeof payload.country === "string"){
        data.country = payload.country.trim() !== "" ? payload.country.trim() : null
      }
    }

    if(Object.keys(data).length === 0){
      throw new BadRequestException("Yangilash uchun ma'lumot yuborilmadi")
    }

    const profile = await this.prisma.profiles.update({
      where:{ id:existProfile.id },
      data,
      select:{
        id:true,
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        update_at:true,
        user:{
          select:{
            username:true,
            email:true,
            avatar:true
          }
        }
      }
    })

    return{
      success:true,
      message:"Profil yangilandi",
      data:{
        ...profile,
        avatar_url:this.getAvatarUrl(profile.user.avatar)
      }
    }
  }

  // ===============>deleteProfile
  async deleteProfile(id:number){
    const existProfile = await this.prisma.profiles.findFirst({
      where:{ user_id:id },
    })

    if(!existProfile) throw new NotFoundException("Profil topilmadi")

    const deletedProfile = await this.prisma.profiles.delete({
      where:{ id:existProfile.id },
      select:{
        id:true,
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        update_at:true,
        user:{
          select:{
            username:true,
            email:true,
            avatar:true
          }
        }
      }
    })

    return{
      success:true,
      message:"Profil o'chirildi",
      data:{
        ...deletedProfile,
        avatar_url:this.getAvatarUrl(deletedProfile.user.avatar)
      }
    }
  }

  //==================>CreateProfile
  async createProfile(id:number,payload:CreateProfileDto){
    const existP = await this.prisma.profiles.findFirst({ where: { user_id: id } })
    
    if(existP) throw new ConflictException("Profile Yaratilgan")
   
   const create = await this.prisma.profiles.create({
      data:{
        user_id:id,
        full_name:payload.full_name,
        phone:payload.phone ?? null,
        country:payload.country ?? null,
      },
      select:{
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        user:{
          select:{
            avatar:true
          }
        }
      }
    })

     const avatar_url = this.getAvatarUrl(create.user.avatar)

    return{
      success:true,
      message:"Profil yaratildi",
      data:{
        ...create,
        avatar_url
      }
    }
  }

  // ===============>createMe
  async createMyProfile(user:{id:number},payload:CreateProfileDto){
    const existP = await this.prisma.profiles.findFirst({where:{user_id:user.id}})
  
    if(existP) throw new ConflictException("Profile Yaratilgan")
   
    const create = await this.prisma.profiles.create({
      data:{
        user_id:user.id,
        full_name:payload.full_name,
        phone:payload.phone ?? null,
        country:payload.country ?? null,
      },
      select:{
        user_id:true,
        full_name:true,
        phone:true,
        country:true,
        created_at:true,
        user:{
          select:{
            avatar:true
          }
        }
      }
    })

    const avatar_url = this.getAvatarUrl(create.user.avatar)

    return{
      success:true,
      message:"Profil yaratildi",
      data:{
        ...create,
        avatar_url
      }
    }
  }


}
