import { CreateBookDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { Author, Book, Publisher } from '@/database/tenant/entities';
import { AuthorsService } from '@/modules/authors/authors.service';
import { CategoriesService } from '@/modules/categories/categories.service';
import { InventoriesService } from '@/modules/inventories/inventories.service';
import { PublishersService } from '@/modules/publishers/publishers.service';
import { TenantService } from '@/tenants/tenant.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    private readonly tenantsService: TenantService,
    private readonly categoriesService: CategoriesService,
    private readonly authorsService: AuthorsService,
    private readonly publishersService: PublishersService,
    private readonly inventoriesService: InventoriesService,
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

  async createBook(createBookDto: CreateBookDto, manger: EntityManager) {
    const { publisherId, authorId, ...res } = createBookDto;

    const bookRepo = manger.getRepository(Book);
    const authorRepo = manger.getRepository(Author);
    const publisherRepo = manger.getRepository(Publisher);

    const author = await this.authorsService.findAuthorByField(
      'id',
      authorId,
      authorRepo,
    );

    if (!author) throw new NotFoundException('Author not found.');

    const publisher = await this.publishersService.getPublisherByField(
      'id',
      publisherId,
      publisherRepo,
    );

    if (!publisher) throw new NotFoundException('Publisher not found.');

    const existingIsbn = await this.findBookByField('isbn', res.isbn, bookRepo);

    if (existingIsbn)
      throw new ConflictException(`Book with isbn ${res.isbn} has existed.`);

    const newBook = bookRepo.create({
      ...res,
      author,
      publisher,
    });
    await bookRepo.save(newBook);

    return newBook;
  }

  async getBooks(userSession: TUserSession) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const bookRepo = dataSource.getRepository(Book);

    return bookRepo.find({
      relations: {
        author: true,
        publisher: true,
      },
    });
  }
}
