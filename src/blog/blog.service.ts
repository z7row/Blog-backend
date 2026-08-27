import { ForbiddenException, Injectable, MethodNotAllowedException, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, Comment } from './schema/blog.schema';
import { UsersModule } from '../users/users.module';
import { User } from '../users/schema/user.schema';


@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }private viewedHistory = new Set<string>();



  async create(createBlogDto: CreateBlogDto, userId: string): Promise<Blog> {

    const user = await this.userModel.findById(userId);
    if (!user || user.name == "Deleted Account") {
      throw new NotFoundException('user not found');
    }
    const createdBlog = new this.blogModel({
      ...createBlogDto,
      author: userId
    });
    return createdBlog.save();
  }


  async findAll(page: number = 1, limit: number = 20): Promise<Blog[]> {
    const skip = (page - 1) * limit;

    return this.blogModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }


  findOne(id: string) {
    return this.blogModel.findById(id)
  }
  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string, userRole: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.name == "Deleted Account") {
      throw new NotFoundException('user not found');
    }
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      throw new NotFoundException('content not found');
    }

    const authorId = blog.author ? String(blog.author) : null;

    if (authorId !== String(userId) && userRole !== 'admin') {
      throw new ForbiddenException('not allowed متخليك في حال امك احسن ومتدخلش علي حاجه يوزر تاني');
    }

    return this.blogModel.findByIdAndUpdate(id, updateBlogDto, { returnDocument: 'after' });
  }

  async remove(id: string, userId: string, userRole: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.name == "Deleted Account") {
      throw new NotFoundException('user not found');
    }
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      throw new NotFoundException('content not found');
    }

    const authorId = blog.author ? String(blog.author) : null;

    if (authorId !== String(userId) && userRole !== 'admin') {
      throw new ForbiddenException('not allowed ملكش دعوه بالي ملكش فيه');
    }

    await this.blogModel.findByIdAndDelete(id);
    return { message: 'deleted successfully' };
  }

  async toggleLike(blogId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.name == "Deleted Account") {
      throw new NotFoundException('user not found');
    }
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

// في blog.service.ts


async MakeViews(blogId: string, clientIp: string) {
  const key = `${blogId}:${clientIp}`;

  // إذا كان هذا الـ IP قد شاهد البوست بالفعل مؤخراً، لا تزد العداد
  if (this.viewedHistory.has(key)) {
    const blog = await this.blogModel.findById(blogId);
    return { views: blog?.views || 0 };
  }

  // إذا كانت أول مرة: أضف للذاكرة وزد العداد في الداتابيز
  this.viewedHistory.add(key);

  // حذف الـ Key بعد 12 ساعة لتسمح بمشاهدة جديدة لاحقاً (اختياري)
  setTimeout(() => this.viewedHistory.delete(key), 12 * 60 * 60 * 1000);

  const blog = await this.blogModel.findByIdAndUpdate(
    blogId,
    { $inc: { views: 1 } },
    { returnDocument: 'after' },
  );

  if (!blog) throw new NotFoundException('Blog not found');

  return { views: blog.views };
}

  // 2. Add Comment
  async addComment(blogId: string, userId: string, content: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.name == "Deleted Account") {
      throw new NotFoundException('user not found');
    }
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    if (!content) {
      throw new ForbiddenException("content not found")
    }
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
    const user = await this.userModel.findById(userId);
    if (!user || user.name == "Deleted Account") {
      throw new NotFoundException('user not found');
    }

    const [blogs, total] = await Promise.all([
      this.blogModel
        .find({ author: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.blogModel.countDocuments({ author: userId }),
    ]);

    return {
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
  async getUserComments(userId: string, page = 1, limit = 10) {
    const user = await this.userModel.findById(userId);
    if (!user || user.name == "Deleted Account") {
      throw new NotFoundException('user not found');
    }
    const skip = (page - 1) * limit;
    const userObjectId = new Types.ObjectId(userId);

    const blogs = await this.blogModel
      .find({ 'comments.author': userObjectId })
      .select('title comments')
      .exec();

    const userComments: any[] = [];

    blogs.forEach((blog) => {
      blog.comments.forEach((comment: any) => {
        if (comment.author?.toString() === userId) {
          userComments.push({
            _id: comment._id,
            content: comment.content,
            createdAt: comment.createdAt,
            blog: {
              _id: blog._id,
              title: blog.title,
            },
          });
        }
      });
    });

    userComments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = userComments.length;
    const paginatedComments = userComments.slice(skip, skip + limit);

    return {
      comments: paginatedComments,
      totalComments: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

// in blog.service.ts (NestJS)
// async incrementViews(blogId: string, clientIp: string) {
//   const cacheKey = `view:${blogId}:${clientIp}`;
  
//   // افحص هل الـ IP ده شاف البوست قريب؟ (استخدام Redis أو CacheManager)
//   const hasViewed = await this.blogModel.get(cacheKey);

//   if (!hasViewed) {
//     // زيادة عدد المشاهدات في الداتابيز
//     await this.blogModel.findByIdAndUpdate(blogId, { $inc: { views: 1 } });
    
//     // منع التكرار لنفس الـ IP لمدة 24 ساعة (86400 ثانية)
//     await this.blogModel.set(cacheKey, true, 86400000);
//   }
// }
}


