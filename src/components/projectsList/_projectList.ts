interface projectsType {
  projectName: string
  description: string
  repoLink: string
  previewLink: string
}

type Projects<T> = T[]

export const projects: Projects<projectsType> = [
    {
    projectName: 'Sign',
    description: 'Create & Share Beautiful Signs Quickly',
    repoLink: 'https://github.com/olcchi/Sign',
    previewLink: 'https://s1gno.cc',
  },
  {
    projectName: 'Gallery',
    description: 'My personal gallery.',
    repoLink: 'https://github.com/olcchi/Gallery',
    previewLink: 'https://gallery.olcchi.me',
  },
  {
    projectName: 'Aggr',
    description: 'An aggregated search engine with multiple search engines.',
    repoLink: 'https://github.com/olcchi/Aggr',
    previewLink: 'https://aggr.olcchi.me',
  },
  {
    projectName: 'olcchi.me',
    description: 'The personal website you are browsing at this moment.',
    repoLink: 'https://github.com/olcchi/olcchi.me',
    previewLink: 'https://olcchi.me',
  },
    {
    projectName: 'Hug',
    description: 'Use ChatGPT to relieve your frustration.',
    repoLink: 'https://github.com/olcchi/hug',
    previewLink: 'https://hug.olcchi.me',
  }
]
