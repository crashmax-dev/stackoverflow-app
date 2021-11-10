import { Heading, Stack, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import stackoverflow from '../unitls/stackexchange-api';
import { QuestionType } from '../interfaces/QuestionType';
import { QuestionListItemSkeleton } from '../components/posts/QuestionListItem.skeleton';
import { QuestionListItem } from '../components/posts/QuestionListItem';

export function SearchPage() {
  const { query } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [questions, setQuestions] = useState<QuestionType[]>([]);

  useEffect(() => {
    search();
  }, [query]);

  async function search() {
    setIsLoaded(false);

    const response: any = await stackoverflow.get(`search/advanced`, {
      order: 'desc',
      sort: 'relevance',
      filter: '!2lIeW85m7AP2q5(2DO8AHd8vNJAJ.OC6dwg0q)FyXc3)q)1FQtsWrOG)TSOfFUEhv.NB4.T(WdmCieWUDmUVbR0*',
      q: query
    });

    setQuestions(response.items);
    setIsLoaded(true);
  }

  return (
    <>
      <Heading>Search results for "{query}"</Heading>
      {/*<Text color="gray">For: "{query}"</Text>*/}

      <Stack spacing="8px" mt="16px">
        {/* Skeletons */}
        {!isLoaded && [...Array(10)].map((_, index) => <QuestionListItemSkeleton key={index} />)}

        {isLoaded && questions.map((question) => <QuestionListItem item={question} key={question.question_id} />)}
      </Stack>
    </>
  );
}
