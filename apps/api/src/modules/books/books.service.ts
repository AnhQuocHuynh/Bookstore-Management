import { CreateBookDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { Author, Book, Category, Publisher } from '@/database/tenant/entities';
import { AuthorsService } from '@/modules/authors/authors.service';
import { CategoriesService } from '@/modules/categories/categories.service';
import { PublishersService } from '@/modules/publishers/publishers.service';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    private readonly tenantsService: TenantService,
    private readonly categoriesService: CategoriesService,
    private readonly authorsService: AuthorsService,
    private readonly publishersService: PublishersService,
  ) {}

  async findBookByField(
    field: keyof Book,
    value: string,
    repo: Repository<Book>,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
      }) ?? null
    );
  }

  async createBook(createBookDto: CreateBookDto, userSession: TUserSession) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId: userSession.bookStoreId,
    });

    const { categoryIds, publisherId, authorId, ...res } = createBookDto;

    const bookRepo = dataSource.getRepository(Book);
    const authorRepo = dataSource.getRepository(Author);
    const categoryRepo = dataSource.getRepository(Category);
    const publisherRepo = dataSource.getRepository(Publisher);

    const author = await this.authorsService.findAuthorByField(
      'id',
      authorId,
      authorRepo,
    );

    if (!author) throw new NotFoundException('Author not found.');

    const categories: Category[] = [];

    await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = await this.categoriesService.findCategoryByField(
          'id',
          categoryId,
          categoryRepo,
        );

        if (!category)
          throw new NotFoundException(`Category ${categoryId} not found.`);

        categories.push(category);
      }),
    );

    const publisher = await this.publishersService.getPublisherByField(
      'id',
      publisherId,
      publisherRepo,
    );

    if (!publisher) throw new NotFoundException('Publisher not found.');

    const newBook = bookRepo.create({
      ...res,
      author,
      publisher,
      categories,
    });
    await bookRepo.save(newBook);

    return {
      message: 'Book created successfully',
      data: newBook,
    };
  }

  private async findAuthorByField(
    field: keyof Author,
    value: string,
    repo: Repository<Author>,
  ) {
    return repo.findOne({
      where: {
        [field]: value,
      },
    });
  }
}
