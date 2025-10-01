export type Flipbook = {
  id: string;
  title: string;
  created_at: string;
  company_name: string | null;
  description: string | null;
  pdf_file_url: string | null;
  pdf_file_name: string | null;
  pdf_file_size: number | null;
  user_id: string;
};

export interface Database {
  public: {
    Tables: {
      flipbooks: {
        Row: {
          id: string;
          title: string;
          company_name: string | null;
          description: string | null;
          pdf_file_url: string | null;
          pdf_file_name: string | null;
          pdf_file_size: number | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          company_name?: string | null;
          description?: string | null;
          pdf_file_url?: string | null;
          pdf_file_name?: string | null;
          pdf_file_size?: number | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          company_name?: string | null;
          description?: string | null;
          pdf_file_url?: string | null;
          pdf_file_name?: string | null;
          pdf_file_size?: number | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
