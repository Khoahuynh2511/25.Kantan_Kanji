import TextParser from '@/shared/components/hanabira/TextParser';
import Sidebar from '@/shared/components/Menu/Sidebar';

export const metadata = {
  title: 'Japanese Text Parser',
  description: 'Analyze Japanese text with morphological tokenization using kuromoji.',
};

export default function TextParserPage() {
  return (
    <div className='min-h-[100dvh] max-w-[100dvw] flex'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-0'>
        <TextParser />
      </main>
    </div>
  );
}
