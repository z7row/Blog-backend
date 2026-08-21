import { ForbiddenException, Injectable, MethodNotAllowedException, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, Comment } from './schema/blog.schema';


@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>
  ,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
  ) {}



  async create(createBlogDto: CreateBlogDto, userId: string): Promise<Blog> {
    const createdBlog = new this.blogModel({
      ...createBlogDto,
      author: userId
    });
    return createdBlog.save();
  }


  async findAll(): Promise<Blog[]> {
    return this.blogModel.find().exec();
  }

  findOne(id: string) {
    return this.blogModel.findById(id)
  }



  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      throw new NotFoundException('content not found');
    }
    const authorId = blog.author ? String(blog.author) : null;
    // console.log("auther" ,authorId, String(userId))
    if (authorId !== String(userId)) {
      throw new ForbiddenException('not allowd متخليك في حال امك احسن وتدخلش علي حاجه يوزر تاني');
    }
    return this.blogModel.findByIdAndUpdate(id, updateBlogDto, { returnDocument: 'after' });
  }
  async remove(id: string, userId: string) {
    const deletedBlog = await this.blogModel.findOneAndDelete({
      _id: id,
      author: userId,
    });

    if (!deletedBlog) {
      const blogExists = await this.blogModel.exists({ _id: id });
      if (!blogExists) {
        throw new NotFoundException('content not found');
      }
      throw new ForbiddenException('not allowed ملكش دعوه بالي ملكش فيه ');
    }

    return { message: 'deleted succesfully' };
  }



  async toggleLike(blogId: string, userId: string) {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('blog not found');

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = blog.likes.some((id) => id.toString() === userId);

    const updateQuery = hasLiked
      ? { $pull: { likes: userObjectId } }
      : { $addToSet: { likes: userObjectId } };

    await this.blogModel.findByIdAndUpdate(blogId, updateQuery);
    return { liked: !hasLiked };
  }

  // 2. Add Comment
  async addComment(blogId: string, userId: string, content: string) {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('blog not found');

    blog.comments.push({
      author: new Types.ObjectId(userId),
      content,
    } as any);

    await blog.save();
    return blog.comments;
  }

  async getComments(blogId: string) {
    const blog = await this.blogModel
      .findById(blogId)
      .populate({
        path: 'comments.author',
        model: 'User',
        select: 'name email',
      });

    if (!blog) throw new NotFoundException('blog not found');
    return blog.comments;
  }
  



async getUserBlogs(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    this.blogModel
      .find({ author: userId }) 
      .sort({ createdAt: -1 })  
      .skip(skip)            
      .limit(limit)     
      .exec(),
    this.blogModel.countDocuments({ author: userId }), // حساب الإجمالي للـ Frontend
  ]);

  return {
    blogs,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}


async getUserComments(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.commentModel
        .find({ author: userId }) // 🔍 أسرع استعلام بشرط وجود index على author
        .populate('blog', 'title logo') // 👈 يجيب عنوان البوست واللوجو المكتوب عليه الكومنت
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments({ author: userId }),
    ]);

    return {
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }


}


