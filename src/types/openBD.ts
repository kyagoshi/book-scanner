export interface OpenBDBook {
  summary: {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    pubdate: string;
    cover: string;
  };
  onix?: {
    DescriptiveDetail?: {
      TitleDetail?: {
        TitleElement?: {
          TitleText?: {
            content: string;
          };
        };
      };
      Contributor?: Array<{
        PersonName?: {
          content: string;
        };
      }>;
    };
    PublishingDetail?: {
      Publisher?: {
        PublisherName: string;
      };
      PublishingDate?: Array<{
        Date: string;
      }>;
    };
    DescriptiveDetail2?: {
      DescriptiveNote?: Array<{
        Note: string;
      }>;
    };
    Measure?: {
      Extent?: {
        ExtentValue: string;
      };
    };
  };
}

export type OpenBDResponse = (OpenBDBook | null)[];
