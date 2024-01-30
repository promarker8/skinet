using Core.Entities;

namespace Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity;

        // we are keeping track of the number of changes made inside the UoW
        // then the complete method is going to save them to our database & return the number of changes
        Task<int> Complete();

        Task Rollback();
    }
}