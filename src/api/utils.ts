import { getCollection } from 'astro:content';
export async function getAllComicNames(filterType) {
  const allcomics = await getCollection("comics");

  // Filter by type if a valid filterType is provided
  const filteredComics = allcomics.filter(
    (comic) => !filterType || comic.data.type === filterType
  );

  // Use a Map to track the latest date per comic title
  const latestDatePerTitle = new Map();

  for (const comic of filteredComics) {
    const [title] = comic.slug.split('/');
    const comicDate = new Date(comic.data.date);

    if (
      !latestDatePerTitle.has(title) ||
      comicDate > latestDatePerTitle.get(title)
    ) {
      latestDatePerTitle.set(title, comicDate);
    }
  }

  // Convert Map to array and sort by date (most recent first)
  const sortedTitles = Array.from(latestDatePerTitle.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([title]) => title);

  return sortedTitles;
}


//params: The name of the comic you want to get
//returns: All of the panels in a comic sorted by id
export async function getPanelsInComic(comicName:string)
{
    const comics = await getCollection('comics', ({ id }) => {
        return id.startsWith(comicName+'/');
    });
    return comics;
}

//params: name of the comic
//returns: the id of the most recent comic
export async function getLatestPanel(comicName:string)
{
    const pages = await getCollection('comics', ({data}) => {    
        return data;
    })
  
    const paths = pages.map(page => {
    const [title, ...slug] = page.slug.split('/');
    return { title:title, page: slug };
    });
    var count=0;
    for(var things of paths)
    {
        if(things.title == comicName)
        {
            count++;
        }
    }
    return count;
}

export async function formatDate(date:string)
{
    var options = {

        year: "numeric"

      };
      var newDate = new Date(date);
      var formattedDate = newDate.toLocaleDateString("en-US",options);
      console.log(formattedDate);
    return formattedDate;
}