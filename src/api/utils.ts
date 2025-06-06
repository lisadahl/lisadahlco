import { getCollection } from 'astro:content';
//@params: none
//@return: A array of string names of all of the comics
export async function getAllComicNames()
{
    //get all comics
    //loop through the comics and split the id by title
    //add titles to array if that title isn't already included
    const allcomics = await getCollection("comics");
    var ArrayOfTitles = [];
    const justComicTtiles = allcomics.map(comicTitle => {
        const [title, ...slug] = comicTitle.slug.split('/');
        if(!ArrayOfTitles.includes(title))
        ArrayOfTitles.push(title);
    
      });
      return ArrayOfTitles;
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
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      var newDate = new Date(date);
      var formattedDate = newDate.toLocaleDateString("en-US",options);
      console.log(formattedDate);
    return formattedDate;
}