import { Injectable, NotAcceptableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { PostVehicleDto } from 'src/dto/post-vehicle.dto';
import * as fs from 'fs';
import * as tmp from 'tmp';

@Injectable()
export class PuppeterService {
  private browser: puppeteer.Browser;
  private page: puppeteer.Page;
  private email: string;
  private ps: string;

  constructor(private readonly configService: ConfigService) {
    this.email = this.configService.get<string>('PUPPETER_EMAIL')!;
    this.ps = this.configService.get<string>('PUPPETER_PS')!;
  }

  private launch = async () => {
    const browser = await puppeteer.launch({
      defaultViewport: { width: 1440, height: 1052 },
    });
    this.browser = browser;
  };

  private logIn = async () => {
    await this.page.waitForSelector('a.login-btn', { visible: true });
    await this.page.click('a.login-btn');

    await this.page.waitForSelector('#email', { visible: true });
    await this.page.type('#email', this.email, { delay: 50 });

    await this.page.waitForSelector('#password', { visible: true });
    await this.page.type('#password', this.ps, { delay: 50 });

    return Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
      this.page.click('button[type="submit"]'),
    ]);
  };

  private nextPage = async () =>
    Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
      this.page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(
          (el) => el.textContent?.includes('Siguiente'),
        );
        if (button) button.click();
      }),
    ]);

  private async selectDropdownByLabel(
    label: string,
    value: string,
    waitForRequestUrl?: string,
  ) {
    await this.page.evaluate((labelText) => {
      const wrappers = Array.from(
        document.querySelectorAll('div.mantine-InputWrapper-root'),
      );
      const match = wrappers.find((wrapper) =>
        wrapper.textContent?.includes(labelText),
      );
      const input = match?.querySelector('input');
      if (input) {
        (input as HTMLElement).focus();
        (input as HTMLInputElement).value = '';
      } else {
        throw new Error(`No input found under label "${labelText}"`);
      }
    }, label);

    let zipWait: Promise<puppeteer.HTTPResponse> | undefined;

    if (waitForRequestUrl) {
      zipWait = this.page.waitForResponse((res) => {
        return (
          res.url().includes(waitForRequestUrl) &&
          res.url().includes(`search=${value}`) &&
          res.status() === 200
        );
      });
    }

    await this.page.keyboard.type(value, { delay: 100 });

    if (zipWait) {
      await zipWait;
    }

    await this.page.evaluate((valueText) => {
      const options = Array.from(
        document.querySelectorAll(
          'div[data-portal="true"] .mantine-Select-option',
        ),
      );

      if (options.length === 0) {
        throw new Error('Not options showed.');
      }

      for (const option of options) {
        const spanText =
          option.querySelector('span')?.textContent?.trim() ?? '';

        const optionValue = option.getAttribute('value');

        if (spanText.toLowerCase().includes(valueText.toLowerCase())) {
          (option as HTMLElement).click();
        }

        if (optionValue === valueText) {
          (option as HTMLElement).click();
        }
      }

      const exactValueOption = document.querySelector(
        `div[data-portal="true"] .mantine-Select-option[value="${valueText}"]`,
      );
      if (exactValueOption) {
        (exactValueOption as HTMLElement).click();
      }
    }, value);
  }

  private uploadImagesAndDescription = async (
    description: string,
    images: Express.Multer.File[],
  ) => {
    await this.page.waitForSelector('.mantine-RichTextEditor-content .tiptap');

    await this.page.focus('.mantine-RichTextEditor-content .tiptap');
    await this.page.keyboard.type(description);

    await this.page.waitForSelector(
      '.mantine-Dropzone-root input[type="file"]',
      {
        visible: true,
      },
    );

    const filePaths: string[] = [];
    for (const image of images) {
      const tempFile = tmp.fileSync({ postfix: '.jpg' });
      await fs.promises.writeFile(tempFile.name, image.buffer);
      filePaths.push(tempFile.name);
    }

    const inputElement = await this.page.$(
      '.mantine-Dropzone-root input[type="file"]',
    );

    if (!inputElement) {
      throw new Error('File input element not found');
    }

    // Upload images one by one and wait for API response each time
    for (const filePath of filePaths) {
      const responsePromise = this.page.waitForResponse((response) =>
        response.url().includes('api.seminuevos.com/v1/photos'),
      );

      await inputElement.uploadFile(filePath);

      await responsePromise;

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    await this.nextPage();
  };

  postVehicle = async (data: PostVehicleDto, images: Express.Multer.File[]) => {
    try {
      await this.launch();

      const [page] = await this.browser.pages();

      this.page = page;

      await this.page.goto('https://www.seminuevos.com/', {
        waitUntil: 'domcontentloaded',
      });

      await this.logIn();

      await this.page.waitForSelector('a.btn-primary', { visible: true });
      await this.page.click('a.btn-primary');

      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

      await this.page.waitForSelector('p ::-p-text(Gold)', { visible: true });

      await this.page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div.bg-white'));

        const goldCard = cards.find((card) => {
          return card.textContent?.includes('Gold');
        });

        const button = goldCard?.querySelector('button');
        if (button) (button as HTMLElement).click();
      });

      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

      await this.selectDropdownByLabel('Marca', data.brand);
      await this.selectDropdownByLabel('Modelo', data.model);
      await this.selectDropdownByLabel('Año', data.year.toString());
      await this.selectDropdownByLabel('Versión', data.vertion.toString());
      await this.selectDropdownByLabel('Subtipo', data.subtype);
      await this.selectDropdownByLabel('Color', data.color);
      await this.selectDropdownByLabel(
        'Código Postal',
        data.zipcode,
        'api.seminuevos.com/v1/core/postal-codes',
      );
      await this.selectDropdownByLabel('Ciudad del vehículo', data.city);
      await this.selectDropdownByLabel('Recorrido', data.mileage);
      await this.selectDropdownByLabel('Precio', data.price);

      await this.page.evaluate((labelText) => {
        const labels = Array.from(document.querySelectorAll('label'));
        const match = labels.find(
          (el) =>
            el.textContent?.trim().toLowerCase() === labelText.toLowerCase(),
        );

        if (!match) {
          throw new Error(`No radio label found with text "${labelText}"`);
        }

        match.click();
      }, data.transaction);

      await this.nextPage();

      await this.uploadImagesAndDescription(data.description, images);

      await page.evaluate((phoneNumber) => {
        const phoneLabel = Array.from(document.querySelectorAll('label')).find(
          (label) => label.textContent?.includes('Teléfono celular'),
        );
        if (phoneLabel) {
          const inputId = phoneLabel.getAttribute('for');
          const input = document.getElementById(inputId as string);
          if (input) {
            (input as HTMLInputElement).value = phoneNumber;
          }
        }
      }, data.phonenumber);

      await this.nextPage();

      await this.page.screenshot({ path: 'after-login.png' });

      return this.page;
    } catch (error) {
      throw new NotAcceptableException(error);
    } finally {
      await this.browser.close();
    }
  };
}
